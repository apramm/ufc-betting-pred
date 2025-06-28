import sys
import json
import sqlite3
import math

def get_database_path():
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, '..', 'data', 'ufc_data.db')

def load_data():
    """Load fighter and fight data from SQLite database"""
    db_path = get_database_path()
    conn = sqlite3.connect(db_path)
    
    # Load fighters
    fighters_df = pd.read_sql_query("""
        SELECT * FROM fighters
    """, conn)
    
    # Load fights with fighter details
    fights_df = pd.read_sql_query("""
        SELECT f.*, 
               f1.name as fighter1_name, f1.wins as f1_wins, f1.losses as f1_losses,
               f1.height_cm as f1_height, f1.reach_cm as f1_reach, f1.stance as f1_stance,
               f1.win_by_ko as f1_ko, f1.win_by_submission as f1_sub, f1.win_by_decision as f1_dec,
               f2.name as fighter2_name, f2.wins as f2_wins, f2.losses as f2_losses,
               f2.height_cm as f2_height, f2.reach_cm as f2_reach, f2.stance as f2_stance,
               f2.win_by_ko as f2_ko, f2.win_by_submission as f2_sub, f2.win_by_decision as f2_dec
        FROM fights f
        JOIN fighters f1 ON f.fighter1_id = f1.id
        JOIN fighters f2 ON f.fighter2_id = f2.id
        WHERE f.winner_id IS NOT NULL
    """, conn)
    
    conn.close()
    return fighters_df, fights_df

def create_features(fights_df):
    """Create features for machine learning model"""
    features = []
    labels = []
    
    for _, fight in fights_df.iterrows():
        # Calculate win rates
        f1_total_fights = fight['f1_wins'] + fight['f1_losses']
        f2_total_fights = fight['f2_wins'] + fight['f2_losses']
        
        f1_win_rate = fight['f1_wins'] / max(f1_total_fights, 1)
        f2_win_rate = fight['f2_wins'] / max(f2_total_fights, 1)
        
        # Calculate finish rates
        f1_finish_rate = (fight['f1_ko'] + fight['f1_sub']) / max(f1_total_fights, 1)
        f2_finish_rate = (fight['f2_ko'] + fight['f2_sub']) / max(f2_total_fights, 1)
        
        # Physical advantages
        height_diff = fight['f1_height'] - fight['f2_height'] if pd.notnull(fight['f1_height']) and pd.notnull(fight['f2_height']) else 0
        reach_diff = fight['f1_reach'] - fight['f2_reach'] if pd.notnull(fight['f1_reach']) and pd.notnull(fight['f2_reach']) else 0
        
        # Stance matchup (orthodox vs southpaw advantage)
        stance_advantage = 0
        if pd.notnull(fight['f1_stance']) and pd.notnull(fight['f2_stance']):
            if fight['f1_stance'] != fight['f2_stance']:
                stance_advantage = 1 if fight['f1_stance'] == 'Southpaw' else -1
        
        # Experience difference
        experience_diff = f1_total_fights - f2_total_fights
        
        feature_vector = [
            f1_win_rate,
            f2_win_rate,
            f1_win_rate - f2_win_rate,  # Win rate difference
            f1_finish_rate,
            f2_finish_rate,
            f1_finish_rate - f2_finish_rate,  # Finish rate difference
            height_diff,
            reach_diff,
            stance_advantage,
            experience_diff,
            fight['f1_wins'],
            fight['f2_wins'],
            fight['f1_ko'],
            fight['f2_ko'],
            fight['f1_sub'],
            fight['f2_sub']
        ]
        
        features.append(feature_vector)
        # Label: 1 if fighter1 wins, 0 if fighter2 wins
        labels.append(1 if fight['winner_id'] == fight['fighter1_id'] else 0)
    
    return np.array(features), np.array(labels)

def train_model():
    """Train the prediction model"""
    try:
        fighters_df, fights_df = load_data()
        
        if len(fights_df) < 5:
            print("Not enough fight data to train a reliable model")
            return None
        
        X, y = create_features(fights_df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train Random Forest model
        model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
        model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        return model, accuracy
    except Exception as e:
        print(f"Error training model: {e}")
        return None

def get_fighter_stats(fighter_id):
    """Get fighter statistics from database"""
    db_path = get_database_path()
    conn = sqlite3.connect(db_path)
    
    query = """
        SELECT f.*,
               COUNT(fights.id) as total_fights,
               SUM(CASE WHEN fights.winner_id = f.id THEN 1 ELSE 0 END) as actual_wins,
               SUM(CASE WHEN fights.winner_id != f.id AND fights.winner_id IS NOT NULL THEN 1 ELSE 0 END) as actual_losses
        FROM fighters f
        LEFT JOIN fights ON (f.id = fights.fighter1_id OR f.id = fights.fighter2_id)
        WHERE f.id = ?
        GROUP BY f.id
    """
    
    cursor = conn.cursor()
    cursor.execute(query, (fighter_id,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        columns = [description[0] for description in cursor.description]
        return dict(zip(columns, result))
    return None

def predict_fight(fighter1_id, fighter2_id, weight_class='', rounds=3):
    """Predict the outcome of a fight"""
    try:
        # Get fighter stats
        fighter1_stats = get_fighter_stats(fighter1_id)
        fighter2_stats = get_fighter_stats(fighter2_id)
        
        if not fighter1_stats or not fighter2_stats:
            return {"error": "Fighter not found"}
        
        # Calculate features for prediction
        f1_total = max(fighter1_stats['total_fights'], 1)
        f2_total = max(fighter2_stats['total_fights'], 1)
        
        f1_win_rate = fighter1_stats['actual_wins'] / f1_total
        f2_win_rate = fighter2_stats['actual_wins'] / f2_total
        
        f1_finish_rate = (fighter1_stats['win_by_ko'] + fighter1_stats['win_by_submission']) / f1_total
        f2_finish_rate = (fighter2_stats['win_by_ko'] + fighter2_stats['win_by_submission']) / f2_total
        
        height_diff = (fighter1_stats['height_cm'] or 0) - (fighter2_stats['height_cm'] or 0)
        reach_diff = (fighter1_stats['reach_cm'] or 0) - (fighter2_stats['reach_cm'] or 0)
        
        stance_advantage = 0
        if fighter1_stats['stance'] and fighter2_stats['stance']:
            if fighter1_stats['stance'] != fighter2_stats['stance']:
                stance_advantage = 1 if fighter1_stats['stance'] == 'Southpaw' else -1
        
        experience_diff = f1_total - f2_total
        
        # Try to use trained model, fallback to simple calculation
        model, accuracy = train_model()
        
        if model:
            feature_vector = np.array([[
                f1_win_rate, f2_win_rate, f1_win_rate - f2_win_rate,
                f1_finish_rate, f2_finish_rate, f1_finish_rate - f2_finish_rate,
                height_diff, reach_diff, stance_advantage, experience_diff,
                fighter1_stats['actual_wins'], fighter2_stats['actual_wins'],
                fighter1_stats['win_by_ko'], fighter2_stats['win_by_ko'],
                fighter1_stats['win_by_submission'], fighter2_stats['win_by_submission']
            ]])
            
            prediction_proba = model.predict_proba(feature_vector)[0]
            predicted_winner_idx = model.predict(feature_vector)[0]
            confidence = max(prediction_proba) * 100
            
            predicted_winner = fighter1_stats if predicted_winner_idx == 1 else fighter2_stats
            
        else:
            # Fallback: simple win rate comparison with adjustments
            f1_score = f1_win_rate * 0.6 + f1_finish_rate * 0.2 + (height_diff / 100) * 0.1 + (experience_diff / 50) * 0.1
            f2_score = f2_win_rate * 0.6 + f2_finish_rate * 0.2 - (height_diff / 100) * 0.1 - (experience_diff / 50) * 0.1
            
            predicted_winner = fighter1_stats if f1_score > f2_score else fighter2_stats
            confidence = min(abs(f1_score - f2_score) * 100 + 50, 95)
        
        # Generate prediction factors
        factors = []
        if f1_win_rate > f2_win_rate:
            factors.append(f"{fighter1_stats['name']} has higher win rate ({f1_win_rate:.1%} vs {f2_win_rate:.1%})")
        else:
            factors.append(f"{fighter2_stats['name']} has higher win rate ({f2_win_rate:.1%} vs {f1_win_rate:.1%})")
        
        if abs(height_diff) > 5:
            taller_fighter = fighter1_stats['name'] if height_diff > 0 else fighter2_stats['name']
            factors.append(f"{taller_fighter} has height advantage ({abs(height_diff):.0f}cm)")
        
        if abs(reach_diff) > 5:
            longer_reach = fighter1_stats['name'] if reach_diff > 0 else fighter2_stats['name']
            factors.append(f"{longer_reach} has reach advantage ({abs(reach_diff):.0f}cm)")
        
        if f1_finish_rate > f2_finish_rate:
            factors.append(f"{fighter1_stats['name']} has higher finish rate ({f1_finish_rate:.1%} vs {f2_finish_rate:.1%})")
        elif f2_finish_rate > f1_finish_rate:
            factors.append(f"{fighter2_stats['name']} has higher finish rate ({f2_finish_rate:.1%} vs {f1_finish_rate:.1%})")
        
        prediction = {
            "fighter1": {
                "id": fighter1_stats['id'],
                "name": fighter1_stats['name'],
                "nickname": fighter1_stats['nickname'],
                "win_rate": f1_win_rate,
                "total_fights": f1_total,
                "wins": fighter1_stats['actual_wins'],
                "losses": fighter1_stats['actual_losses']
            },
            "fighter2": {
                "id": fighter2_stats['id'],
                "name": fighter2_stats['name'],
                "nickname": fighter2_stats['nickname'],
                "win_rate": f2_win_rate,
                "total_fights": f2_total,
                "wins": fighter2_stats['actual_wins'],
                "losses": fighter2_stats['actual_losses']
            },
            "predicted_winner": {
                "id": predicted_winner['id'],
                "name": predicted_winner['name'],
                "nickname": predicted_winner['nickname']
            },
            "confidence": round(confidence, 1),
            "factors": factors,
            "weight_class": weight_class,
            "rounds": rounds,
            "model_accuracy": round(accuracy * 100, 1) if model else "N/A (fallback method)"
        }
        
        return prediction
        
    except Exception as e:
        return {"error": f"Prediction error: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python predict.py <fighter1_id> <fighter2_id> [weight_class] [rounds]"}))
        sys.exit(1)
    
    fighter1_id = int(sys.argv[1])
    fighter2_id = int(sys.argv[2])
    weight_class = sys.argv[3] if len(sys.argv) > 3 else ''
    rounds = int(sys.argv[4]) if len(sys.argv) > 4 else 3
    
    result = predict_fight(fighter1_id, fighter2_id, weight_class, rounds)
    print(json.dumps(result, indent=2))
