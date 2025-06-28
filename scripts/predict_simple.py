import sys
import json
import sqlite3
import os

def get_database_path():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, '..', 'data', 'ufc_data.db')

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

def calculate_score(fighter_stats):
    """Calculate a composite score for a fighter based on various factors"""
    if not fighter_stats:
        return 0
    
    # Get basic stats
    total_fights = max(fighter_stats.get('total_fights', 0), 1)
    wins = fighter_stats.get('actual_wins', 0)
    losses = fighter_stats.get('actual_losses', 0)
    
    # Calculate win rate
    win_rate = wins / max(wins + losses, 1)
    
    # Calculate finish rate
    ko_wins = fighter_stats.get('win_by_ko', 0)
    sub_wins = fighter_stats.get('win_by_submission', 0)
    finish_rate = (ko_wins + sub_wins) / max(total_fights, 1)
    
    # Experience factor (diminishing returns after 20 fights)
    experience_factor = min(total_fights / 20.0, 1.0)
    
    # Physical attributes (normalized)
    height = fighter_stats.get('height_cm', 175) / 190.0  # Normalize around 175cm
    reach = fighter_stats.get('reach_cm', 180) / 200.0   # Normalize around 180cm
    
    # Composite score calculation
    score = (
        win_rate * 0.4 +           # 40% weight on win rate
        finish_rate * 0.2 +        # 20% weight on finish rate
        experience_factor * 0.15 + # 15% weight on experience
        height * 0.1 +             # 10% weight on height
        reach * 0.1 +              # 10% weight on reach
        (wins / max(total_fights, 1)) * 0.05  # 5% weight on activity
    )
    
    return min(score, 1.0)  # Cap at 1.0

def predict_fight(fighter1_id, fighter2_id, weight_class='', rounds=3):
    """Predict the outcome of a fight using statistical analysis"""
    try:
        # Get fighter stats
        fighter1_stats = get_fighter_stats(fighter1_id)
        fighter2_stats = get_fighter_stats(fighter2_id)
        
        if not fighter1_stats or not fighter2_stats:
            return {"error": "Fighter not found"}
        
        # Calculate scores
        f1_score = calculate_score(fighter1_stats)
        f2_score = calculate_score(fighter2_stats)
        
        # Determine winner
        if f1_score > f2_score:
            predicted_winner = fighter1_stats
            confidence = min((f1_score - f2_score) * 100 + 55, 95)
        else:
            predicted_winner = fighter2_stats
            confidence = min((f2_score - f1_score) * 100 + 55, 95)
        
        # Generate prediction factors
        factors = []
        
        # Win rate comparison
        f1_win_rate = fighter1_stats.get('actual_wins', 0) / max(fighter1_stats.get('actual_wins', 0) + fighter1_stats.get('actual_losses', 0), 1)
        f2_win_rate = fighter2_stats.get('actual_wins', 0) / max(fighter2_stats.get('actual_wins', 0) + fighter2_stats.get('actual_losses', 0), 1)
        
        if f1_win_rate > f2_win_rate:
            factors.append(f"{fighter1_stats['name']} has higher win rate ({f1_win_rate:.1%} vs {f2_win_rate:.1%})")
        elif f2_win_rate > f1_win_rate:
            factors.append(f"{fighter2_stats['name']} has higher win rate ({f2_win_rate:.1%} vs {f1_win_rate:.1%})")
        
        # Physical advantages
        height_diff = (fighter1_stats.get('height_cm', 0) or 0) - (fighter2_stats.get('height_cm', 0) or 0)
        if abs(height_diff) > 5:
            taller_fighter = fighter1_stats['name'] if height_diff > 0 else fighter2_stats['name']
            factors.append(f"{taller_fighter} has significant height advantage ({abs(height_diff):.0f}cm)")
        
        reach_diff = (fighter1_stats.get('reach_cm', 0) or 0) - (fighter2_stats.get('reach_cm', 0) or 0)
        if abs(reach_diff) > 5:
            longer_reach = fighter1_stats['name'] if reach_diff > 0 else fighter2_stats['name']
            factors.append(f"{longer_reach} has significant reach advantage ({abs(reach_diff):.0f}cm)")
        
        # Finish rate comparison
        f1_finish_rate = (fighter1_stats.get('win_by_ko', 0) + fighter1_stats.get('win_by_submission', 0)) / max(fighter1_stats.get('total_fights', 1), 1)
        f2_finish_rate = (fighter2_stats.get('win_by_ko', 0) + fighter2_stats.get('win_by_submission', 0)) / max(fighter2_stats.get('total_fights', 1), 1)
        
        if f1_finish_rate > f2_finish_rate:
            factors.append(f"{fighter1_stats['name']} has higher finish rate ({f1_finish_rate:.1%} vs {f2_finish_rate:.1%})")
        elif f2_finish_rate > f1_finish_rate:
            factors.append(f"{fighter2_stats['name']} has higher finish rate ({f2_finish_rate:.1%} vs {f1_finish_rate:.1%})")
        
        # Experience factor
        f1_experience = fighter1_stats.get('total_fights', 0)
        f2_experience = fighter2_stats.get('total_fights', 0)
        if abs(f1_experience - f2_experience) > 5:
            more_experienced = fighter1_stats['name'] if f1_experience > f2_experience else fighter2_stats['name']
            factors.append(f"{more_experienced} has significantly more experience ({max(f1_experience, f2_experience)} vs {min(f1_experience, f2_experience)} fights)")
        
        # Stance matchup
        if fighter1_stats.get('stance') and fighter2_stats.get('stance'):
            if fighter1_stats['stance'] != fighter2_stats['stance']:
                factors.append("Stance mismatch could create interesting dynamics")
        
        prediction = {
            "fighter1": {
                "id": fighter1_stats['id'],
                "name": fighter1_stats['name'],
                "nickname": fighter1_stats.get('nickname', ''),
                "win_rate": f1_win_rate,
                "total_fights": f1_experience,
                "wins": fighter1_stats.get('actual_wins', 0),
                "losses": fighter1_stats.get('actual_losses', 0)
            },
            "fighter2": {
                "id": fighter2_stats['id'],
                "name": fighter2_stats['name'],
                "nickname": fighter2_stats.get('nickname', ''),
                "win_rate": f2_win_rate,
                "total_fights": f2_experience,
                "wins": fighter2_stats.get('actual_wins', 0),
                "losses": fighter2_stats.get('actual_losses', 0)
            },
            "predicted_winner": {
                "id": predicted_winner['id'],
                "name": predicted_winner['name'],
                "nickname": predicted_winner.get('nickname', '')
            },
            "confidence": round(confidence, 1),
            "factors": factors,
            "weight_class": weight_class,
            "rounds": rounds,
            "model_accuracy": "Statistical Analysis Model"
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
