from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import re  # untuk validasi input kota

app = Flask(__name__)
CORS(app)

# API Key dari WeatherAPI
WEATHER_API_KEY = "b78409b034754fbba02231338251710"
BASE_URL = "https://api.weatherapi.com/v1"

# Timeout agar tidak menggantung jika server lambat
TIMEOUT = 5  # detik


# =========================
# 🏠 ROUTE UTAMA
# =========================
@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to WeatherAPI Flask Backend",
        "endpoints": {
            "/current?city=<city_name>": "Get current weather data",
            "/forecast?city=<city_name>&days=<n>": "Get weather forecast for N days",
            "/all": "Get weather data for multiple cities"
        }
    })


# =========================
# 🌦️ CUACA SAAT INI
# =========================
@app.route("/current")
def get_current_weather():
    city = request.args.get("city", "").strip()

    # Validasi input: hanya huruf dan spasi
    if not city or not re.match(r"^[a-zA-Z\s]+$", city):
        return jsonify({"error": "Parameter 'city' harus berupa huruf dan tidak boleh kosong"}), 400

    try:
        url = f"{BASE_URL}/current.json?key={WEATHER_API_KEY}&q={city}&aqi=no"
        response = requests.get(url, timeout=TIMEOUT)
        data = response.json()

        # Cek error dari API
        if response.status_code != 200 or "error" in data:
            return jsonify({"error": data.get("error", {}).get("message", "Kota tidak ditemukan")}), 404

        current = data["current"]
        location = data["location"]

        # 🔍 Validasi: pastikan nama kota dari API sama persis dengan input user
        if location["name"].lower() != city.lower():
            return jsonify({"error": f"Kota '{city}' tidak ditemukan"}), 404

        return jsonify({
            "city": location["name"],
            "region": location["region"],
            "country": location["country"],
            "localtime": location["localtime"],
            "temp_c": current["temp_c"],
            "feelslike_c": current["feelslike_c"],
            "humidity": current["humidity"],
            "pressure_mb": current["pressure_mb"],
            "wind_kph": current["wind_kph"],
            "condition": current["condition"]["text"],
            "icon": current["condition"]["icon"],
            "uv": current["uv"]
        })

    except requests.exceptions.Timeout:
        return jsonify({"error": "Koneksi ke WeatherAPI timeout"}), 504
    except Exception as e:
        return jsonify({"error": f"Terjadi kesalahan server: {str(e)}"}), 500


# =========================
# 📅 PERKIRAAN CUACA
# =========================
@app.route("/forecast")
def get_forecast():
    city = request.args.get("city", "").strip()
    days = request.args.get("days", 3)

    # Validasi input
    if not city or not re.match(r"^[a-zA-Z\s]+$", city):
        return jsonify({"error": "Parameter 'city' harus berupa huruf dan tidak boleh kosong"}), 400
    try:
        days = int(days)
        if days < 1 or days > 10:
            return jsonify({"error": "Parameter 'days' harus antara 1-10"}), 400
    except ValueError:
        return jsonify({"error": "Parameter 'days' harus berupa angka"}), 400

    try:
        url = f"{BASE_URL}/forecast.json?key={WEATHER_API_KEY}&q={city}&days={days}&aqi=no&alerts=no"
        response = requests.get(url, timeout=TIMEOUT)
        data = response.json()

        # Cek error dari API
        if response.status_code != 200 or "error" in data:
            return jsonify({"error": data.get("error", {}).get("message", "Kota tidak ditemukan")}), 404

        # 🔍 Validasi: pastikan nama kota dari API sama dengan input
        if data["location"]["name"].lower() != city.lower():
            return jsonify({"error": f"Kota '{city}' tidak ditemukan"}), 404

        forecast_data = [
            {
                "date": day["date"],
                "avgtemp_c": day["day"]["avgtemp_c"],
                "maxtemp_c": day["day"]["maxtemp_c"],
                "mintemp_c": day["day"]["mintemp_c"],
                "humidity": day["day"]["avghumidity"],
                "condition": day["day"]["condition"]["text"],
                "icon": day["day"]["condition"]["icon"],
                "uv": day["day"]["uv"]
            }
            for day in data["forecast"]["forecastday"]
        ]

        return jsonify({
            "city": data["location"]["name"],
            "country": data["location"]["country"],
            "forecast": forecast_data
        })

    except requests.exceptions.Timeout:
        return jsonify({"error": "Koneksi ke WeatherAPI timeout"}), 504
    except Exception as e:
        return jsonify({"error": f"Terjadi kesalahan server: {str(e)}"}), 500


# =========================
# 🌍 CUACA BANYAK KOTA
# =========================
@app.route("/all")
def get_all_cities():
    cities = [
        "Jakarta", "Tokyo", "London", "New York", "Paris",
        "Sydney", "Dubai", "Seoul", "Moscow", "Bangkok"
    ]
    all_data = []

    try:
        for city in cities:
            try:
                url = f"{BASE_URL}/current.json?key={WEATHER_API_KEY}&q={city}&aqi=no"
                response = requests.get(url, timeout=TIMEOUT)
                data = response.json()

                if response.status_code == 200 and "current" in data:
                    current = data["current"]
                    location = data["location"]

                    all_data.append({
                        "city": location["name"],
                        "country": location["country"],
                        "temp_c": current["temp_c"],
                        "humidity": current["humidity"],
                        "wind_kph": current["wind_kph"],
                        "condition": current["condition"]["text"],
                        "icon": current["condition"]["icon"],
                        "uv": current["uv"],
                        "vis_km": current["vis_km"]
                    })
                else:
                    all_data.append({
                        "city": city,
                        "error": data.get("error", {}).get("message", "Gagal mengambil data")
                    })

            except requests.exceptions.Timeout:
                all_data.append({
                    "city": city,
                    "error": "Timeout saat mengambil data"
                })

        return jsonify(all_data)

    except Exception as e:
        return jsonify({"error": f"Terjadi kesalahan server: {str(e)}"}), 500


# =========================
# 🚀 JALANKAN SERVER
# =========================
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
