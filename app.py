from flask import Flask, render_template, request, jsonify
import pandas as pd
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load movie dataset
def load_movies():
    try:
        movies_path = os.path.join(os.path.dirname(__file__), "data", "movies.csv")
        if not os.path.exists(movies_path):
            print("❌ Error: movies.csv not found!")
            return None
        
        movies = pd.read_csv(movies_path, encoding="utf-8")
        movies["title_lower"] = movies["title"].str.lower().str.strip()
        return movies
    except Exception as e:
        print(f"❌ Error loading movies: {e}")
        return None

movies_df = load_movies()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/recommend", methods=["GET"])
def recommend():
    movie_title = request.args.get("title", "").strip().lower()
    
    if not movie_title:
        return jsonify({"error": "No movie title provided"}), 400
    
    if movies_df is None:
        return jsonify({"error": "Movie database not available"}), 500
    
    # Check if movie exists (case-insensitive)
    matching_movies = movies_df[movies_df["title_lower"] == movie_title]
    
    if matching_movies.empty:
        return jsonify({"error": "Movie not found in database"}), 404

    # Generate recommendations (5 random movies excluding the searched one)
    try:
        recommended_movies = movies_df[movies_df["title_lower"] != movie_title].sample(5)
        recommendations = recommended_movies[["title", "genres"]].to_dict('records')
        
        return jsonify({
            "searched_movie": matching_movies.iloc[0]["title"],
            "recommended": recommendations
        })
    except Exception as e:
        return jsonify({"error": "Error generating recommendations"}), 500

if __name__ == "__main__":
    app.run(debug=True)