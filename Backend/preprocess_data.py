import pandas as pd
import json

def preprocess_company_data():
    """
    Preprocess the company data from CSV file:
    1. Read the CSV file
    2. Clean and format the data
    3. Save processed data to a new CSV file
    """
    try:
        # Read the original CSV file
        df = pd.read_csv('data_sample.csv', 
                        encoding='utf-8',
                        sep=',',
                        quotechar='"',
                        doublequote=True,
                        engine='python',
                        on_bad_lines='warn')
        
        # Create a new DataFrame with the required structure
        processed_data = []
        for _, row in df.iterrows():
            company = {
                'id': row['id_perusahaan'],
                'name': row['nama_perusahaan'],
                'category': row['kategori_bidang'],
                'specialization': row['spesialisasi_bidang'],
                'location': row['kota_sumsel'],
                'description': row['deskripsi_singkat'],
                'required_skills': row['prediksi_skill_dibutuhkan'].split(';') if pd.notna(row['prediksi_skill_dibutuhkan']) else [],
                'data_source': row['sumber_data']
            }
            processed_data.append(company)
        
        # Save processed data to a new CSV file
        processed_df = pd.DataFrame(processed_data)
        processed_df.to_csv('processed_companies.csv', index=False, encoding='utf-8')
        
        # Also save as JSON for easier API consumption
        with open('processed_companies.json', 'w', encoding='utf-8') as f:
            json.dump(processed_data, f, ensure_ascii=False, indent=2)
            
        print("Data preprocessing completed successfully!")
        print(f"Total companies processed: {len(processed_data)}")
        
    except Exception as e:
        print(f"Error during preprocessing: {str(e)}")
        raise

if __name__ == '__main__':
    preprocess_company_data()
