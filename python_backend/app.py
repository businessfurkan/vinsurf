from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import io
import traceback
import json
import math

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# YKS Puan Hesaplama için katsayılar
TYT_KATSAYILARI = {
    "Türkçe": 3.3,
    "Sosyal": 3.4,
    "Matematik": 3.3,
    "Fen": 3.4
}

AYT_SAY_KATSAYILARI = {
    "Matematik": 3.0,
    "Fizik": 2.85,
    "Kimya": 3.07,
    "Biyoloji": 3.07
}

AYT_SOZ_KATSAYILARI = {
    "Edebiyat": 3.0,
    "Tarih1": 2.80,
    "Cografya1": 3.33,
    "Tarih2": 2.91,
    "Cografya2": 2.91,
    "Felsefe": 3.0,
    "Din": 3.33
}

AYT_EA_KATSAYILARI = {
    "Matematik": 3.0,
    "Edebiyat": 3.0,
    "Tarih1": 2.80,
    "Cografya1": 3.33
}

AYT_DIL_KATSAYILARI = {
    "YabanciDil": 3.0
}

@app.route('/api/run-python', methods=['POST'])
def run_python_code():
    """
    Endpoint to execute Python code sent from the frontend
    """
    try:
        # Get the Python code from the request
        data = request.json
        code = data.get('code', '')
        
        if not code:
            return jsonify({'error': 'No code provided'}), 400
        
        # Capture stdout to get print statements
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output
        
        # Create a dictionary to store variables for return
        result_dict = {}
        
        try:
            # Execute the code
            exec_globals = {}
            exec(code, exec_globals)
            
            # Get printed output
            output = redirected_output.getvalue()
            
            # Get variables that might be useful
            # Filter out built-ins and modules
            result_dict = {k: str(v) for k, v in exec_globals.items() 
                          if not k.startswith('__') and not k == 'builtins'}
            
            return jsonify({
                'success': True,
                'output': output,
                'variables': result_dict
            })
            
        except Exception as e:
            # Get the error message and traceback
            error_message = str(e)
            error_traceback = traceback.format_exc()
            
            return jsonify({
                'success': False,
                'error': error_message,
                'traceback': error_traceback,
                'output': redirected_output.getvalue()  # Include any output before the error
            })
            
        finally:
            # Restore stdout
            sys.stdout = old_stdout
            
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint
    """
    return jsonify({'status': 'ok', 'message': 'Python backend is running'})

@app.route('/api/yks-hesapla', methods=['POST'])
def yks_hesapla():
    """
    YKS puan hesaplama endpoint'i
    """
    try:
        data = request.json
        
        # TYT verileri
        tyt_turkce_dogru = int(data.get('tyt_turkce_dogru', 0))
        tyt_turkce_yanlis = int(data.get('tyt_turkce_yanlis', 0))
        tyt_sosyal_dogru = int(data.get('tyt_sosyal_dogru', 0))
        tyt_sosyal_yanlis = int(data.get('tyt_sosyal_yanlis', 0))
        tyt_matematik_dogru = int(data.get('tyt_matematik_dogru', 0))
        tyt_matematik_yanlis = int(data.get('tyt_matematik_yanlis', 0))
        tyt_fen_dogru = int(data.get('tyt_fen_dogru', 0))
        tyt_fen_yanlis = int(data.get('tyt_fen_yanlis', 0))
        
        # AYT verileri
        ayt_matematik_dogru = int(data.get('ayt_matematik_dogru', 0))
        ayt_matematik_yanlis = int(data.get('ayt_matematik_yanlis', 0))
        ayt_fizik_dogru = int(data.get('ayt_fizik_dogru', 0))
        ayt_fizik_yanlis = int(data.get('ayt_fizik_yanlis', 0))
        ayt_kimya_dogru = int(data.get('ayt_kimya_dogru', 0))
        ayt_kimya_yanlis = int(data.get('ayt_kimya_yanlis', 0))
        ayt_biyoloji_dogru = int(data.get('ayt_biyoloji_dogru', 0))
        ayt_biyoloji_yanlis = int(data.get('ayt_biyoloji_yanlis', 0))
        ayt_edebiyat_dogru = int(data.get('ayt_edebiyat_dogru', 0))
        ayt_edebiyat_yanlis = int(data.get('ayt_edebiyat_yanlis', 0))
        ayt_tarih1_dogru = int(data.get('ayt_tarih1_dogru', 0))
        ayt_tarih1_yanlis = int(data.get('ayt_tarih1_yanlis', 0))
        ayt_cografya1_dogru = int(data.get('ayt_cografya1_dogru', 0))
        ayt_cografya1_yanlis = int(data.get('ayt_cografya1_yanlis', 0))
        ayt_tarih2_dogru = int(data.get('ayt_tarih2_dogru', 0))
        ayt_tarih2_yanlis = int(data.get('ayt_tarih2_yanlis', 0))
        ayt_cografya2_dogru = int(data.get('ayt_cografya2_dogru', 0))
        ayt_cografya2_yanlis = int(data.get('ayt_cografya2_yanlis', 0))
        ayt_felsefe_dogru = int(data.get('ayt_felsefe_dogru', 0))
        ayt_felsefe_yanlis = int(data.get('ayt_felsefe_yanlis', 0))
        ayt_din_dogru = int(data.get('ayt_din_dogru', 0))
        ayt_din_yanlis = int(data.get('ayt_din_yanlis', 0))
        ayt_dil_dogru = int(data.get('ayt_dil_dogru', 0))
        ayt_dil_yanlis = int(data.get('ayt_dil_yanlis', 0))
        
        # Diploma notu
        diploma_notu = float(data.get('diploma_notu', 0))
        
        # Net hesaplama
        tyt_turkce_net = tyt_turkce_dogru - (tyt_turkce_yanlis * 0.25)
        tyt_sosyal_net = tyt_sosyal_dogru - (tyt_sosyal_yanlis * 0.25)
        tyt_matematik_net = tyt_matematik_dogru - (tyt_matematik_yanlis * 0.25)
        tyt_fen_net = tyt_fen_dogru - (tyt_fen_yanlis * 0.25)
        
        ayt_matematik_net = ayt_matematik_dogru - (ayt_matematik_yanlis * 0.25)
        ayt_fizik_net = ayt_fizik_dogru - (ayt_fizik_yanlis * 0.25)
        ayt_kimya_net = ayt_kimya_dogru - (ayt_kimya_yanlis * 0.25)
        ayt_biyoloji_net = ayt_biyoloji_dogru - (ayt_biyoloji_yanlis * 0.25)
        ayt_edebiyat_net = ayt_edebiyat_dogru - (ayt_edebiyat_yanlis * 0.25)
        ayt_tarih1_net = ayt_tarih1_dogru - (ayt_tarih1_yanlis * 0.25)
        ayt_cografya1_net = ayt_cografya1_dogru - (ayt_cografya1_yanlis * 0.25)
        ayt_tarih2_net = ayt_tarih2_dogru - (ayt_tarih2_yanlis * 0.25)
        ayt_cografya2_net = ayt_cografya2_dogru - (ayt_cografya2_yanlis * 0.25)
        ayt_felsefe_net = ayt_felsefe_dogru - (ayt_felsefe_yanlis * 0.25)
        ayt_din_net = ayt_din_dogru - (ayt_din_yanlis * 0.25)
        ayt_dil_net = ayt_dil_dogru - (ayt_dil_yanlis * 0.25)
        
        # TYT Ham Puan Hesaplama (100 puan başlangıç)
        tyt_ham_puan = 100 + (tyt_turkce_net * TYT_KATSAYILARI["Türkçe"]) + \
                      (tyt_sosyal_net * TYT_KATSAYILARI["Sosyal"]) + \
                      (tyt_matematik_net * TYT_KATSAYILARI["Matematik"]) + \
                      (tyt_fen_net * TYT_KATSAYILARI["Fen"])
        
        # AYT Ham Puan Hesaplama (Sayısal)
        say_ham_puan = 100 + (tyt_turkce_net * TYT_KATSAYILARI["Türkçe"] * 0.4) + \
                      (tyt_sosyal_net * TYT_KATSAYILARI["Sosyal"] * 0.4) + \
                      (tyt_matematik_net * TYT_KATSAYILARI["Matematik"] * 0.4) + \
                      (tyt_fen_net * TYT_KATSAYILARI["Fen"] * 0.4) + \
                      (ayt_matematik_net * AYT_SAY_KATSAYILARI["Matematik"]) + \
                      (ayt_fizik_net * AYT_SAY_KATSAYILARI["Fizik"]) + \
                      (ayt_kimya_net * AYT_SAY_KATSAYILARI["Kimya"]) + \
                      (ayt_biyoloji_net * AYT_SAY_KATSAYILARI["Biyoloji"])
        
        # AYT Ham Puan Hesaplama (Sözel)
        soz_ham_puan = 100 + (tyt_turkce_net * TYT_KATSAYILARI["Türkçe"] * 0.4) + \
                      (tyt_sosyal_net * TYT_KATSAYILARI["Sosyal"] * 0.4) + \
                      (tyt_matematik_net * TYT_KATSAYILARI["Matematik"] * 0.4) + \
                      (tyt_fen_net * TYT_KATSAYILARI["Fen"] * 0.4) + \
                      (ayt_edebiyat_net * AYT_SOZ_KATSAYILARI["Edebiyat"]) + \
                      (ayt_tarih1_net * AYT_SOZ_KATSAYILARI["Tarih1"]) + \
                      (ayt_cografya1_net * AYT_SOZ_KATSAYILARI["Cografya1"]) + \
                      (ayt_tarih2_net * AYT_SOZ_KATSAYILARI["Tarih2"]) + \
                      (ayt_cografya2_net * AYT_SOZ_KATSAYILARI["Cografya2"]) + \
                      (ayt_felsefe_net * AYT_SOZ_KATSAYILARI["Felsefe"]) + \
                      (ayt_din_net * AYT_SOZ_KATSAYILARI["Din"])
        
        # AYT Ham Puan Hesaplama (Eşit Ağırlık)
        ea_ham_puan = 100 + (tyt_turkce_net * TYT_KATSAYILARI["Türkçe"] * 0.4) + \
                     (tyt_sosyal_net * TYT_KATSAYILARI["Sosyal"] * 0.4) + \
                     (tyt_matematik_net * TYT_KATSAYILARI["Matematik"] * 0.4) + \
                     (tyt_fen_net * TYT_KATSAYILARI["Fen"] * 0.4) + \
                     (ayt_matematik_net * AYT_EA_KATSAYILARI["Matematik"]) + \
                     (ayt_edebiyat_net * AYT_EA_KATSAYILARI["Edebiyat"]) + \
                     (ayt_tarih1_net * AYT_EA_KATSAYILARI["Tarih1"]) + \
                     (ayt_cografya1_net * AYT_EA_KATSAYILARI["Cografya1"])
        
        # AYT Ham Puan Hesaplama (Dil)
        dil_ham_puan = 100 + (tyt_turkce_net * TYT_KATSAYILARI["Türkçe"] * 0.4) + \
                      (tyt_sosyal_net * TYT_KATSAYILARI["Sosyal"] * 0.4) + \
                      (tyt_matematik_net * TYT_KATSAYILARI["Matematik"] * 0.4) + \
                      (tyt_fen_net * TYT_KATSAYILARI["Fen"] * 0.4) + \
                      (ayt_dil_net * AYT_DIL_KATSAYILARI["YabanciDil"])
        
        # OBP (Okul Başarı Puanı) Hesaplama
        obp = diploma_notu * 5
        
        # Yerleştirme Puanı Hesaplama
        tyt_yerlestirme_puani = tyt_ham_puan + (obp * 0.6)
        say_yerlestirme_puani = say_ham_puan + (obp * 0.6)
        soz_yerlestirme_puani = soz_ham_puan + (obp * 0.6)
        ea_yerlestirme_puani = ea_ham_puan + (obp * 0.6)
        dil_yerlestirme_puani = dil_ham_puan + (obp * 0.6)
        
        # Yaklaşık sıralama hesaplama (basit bir algoritma)
        # Not: Gerçek sıralama için ÖSYM'nin standart sapma hesaplamaları gerekir
        tyt_siralama = int(2000000 / (1 + math.exp(0.05 * (tyt_ham_puan - 200))))
        say_siralama = int(500000 / (1 + math.exp(0.05 * (say_ham_puan - 250))))
        soz_siralama = int(500000 / (1 + math.exp(0.05 * (soz_ham_puan - 250))))
        ea_siralama = int(500000 / (1 + math.exp(0.05 * (ea_ham_puan - 250))))
        dil_siralama = int(150000 / (1 + math.exp(0.05 * (dil_ham_puan - 250))))
        
        return jsonify({
            'success': True,
            'tyt': {
                'net': {
                    'turkce': round(tyt_turkce_net, 2),
                    'sosyal': round(tyt_sosyal_net, 2),
                    'matematik': round(tyt_matematik_net, 2),
                    'fen': round(tyt_fen_net, 2),
                    'toplam': round(tyt_turkce_net + tyt_sosyal_net + tyt_matematik_net + tyt_fen_net, 2)
                },
                'ham_puan': round(tyt_ham_puan, 2),
                'yerlestirme_puani': round(tyt_yerlestirme_puani, 2),
                'siralama': tyt_siralama
            },
            'say': {
                'ham_puan': round(say_ham_puan, 2),
                'yerlestirme_puani': round(say_yerlestirme_puani, 2),
                'siralama': say_siralama
            },
            'soz': {
                'ham_puan': round(soz_ham_puan, 2),
                'yerlestirme_puani': round(soz_yerlestirme_puani, 2),
                'siralama': soz_siralama
            },
            'ea': {
                'ham_puan': round(ea_ham_puan, 2),
                'yerlestirme_puani': round(ea_yerlestirme_puani, 2),
                'siralama': ea_siralama
            },
            'dil': {
                'ham_puan': round(dil_ham_puan, 2),
                'yerlestirme_puani': round(dil_yerlestirme_puani, 2),
                'siralama': dil_siralama
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
