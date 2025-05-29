from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
import json
from preprocess_data import preprocess_company_data

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
print("Flask app starting...")

@app.route('/')
def home():
    return "API is running"

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    try:
        user_profile = request.json
        user_skills = set(skill.lower() for skill in user_profile.get('skills', []))

        json_path = os.path.join(os.path.dirname(__file__), 'processed_companies.json')
        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                companies = json.load(f)
        else:
            return jsonify({
                "status": "error",
                "message": "Processed company data not found"
            }), 500

        recommendations = []
        for company in companies:
            company_skills = set(s.lower() for s in company.get('required_skills', []))
            match_count = len(user_skills.intersection(company_skills))
            total_skills = len(company_skills) if company_skills else 1
            match_percentage = int((match_count / total_skills) * 100)

            if match_percentage > 0:
                recommendations.append({
                    'id_perusahaan': company.get('id'),
                    'nama_perusahaan': company.get('name'),
                    'kategori_bidang': company.get('category'),
                    'deskripsi_singkat': company.get('description'),
                    'match_percentage': match_percentage,
                    'alasan_rekomendasi': f"Matching skills: {match_count} out of {total_skills}"
                })

        # Sort recommendations by match_percentage descending
        recommendations.sort(key=lambda x: x['match_percentage'], reverse=True)

        return jsonify({
            "status": "success",
            "message": "Personalized recommendations retrieved successfully",
            "data": recommendations[:5]  # Return top 5 recommendations
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/companies', methods=['GET'])
def get_companies():
    try:
        # Try to read from processed JSON first
        json_path = os.path.join(os.path.dirname(__file__), 'processed_companies.json')
        if os.path.exists(json_path):
            print(f"Reading processed JSON from: {json_path}")
            with open(json_path, 'r', encoding='utf-8') as f:
                companies = json.load(f)
        else:
            # Fallback to CSV if JSON doesn't exist
            csv_path = os.path.join(os.path.dirname(__file__), 'processed_companies.csv')
            print(f"Reading processed CSV from: {csv_path}")
            df = pd.read_csv(csv_path, encoding='utf-8')
            companies = df.to_dict('records')
        return jsonify({
            'status': 'success',
            'companies': companies
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting preprocessing...")
    try:
        preprocess_company_data()
        print("\nStarting Flask server...")
        app.run(debug=True, host='0.0.0.0', port=5001)
    except Exception as e:
        print(f"Error: {str(e)}")
