from flask import Flask, render_template, request, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Load movie dataset
movies_path = os.path.join(os.path.dirname(__file__), "movies.csv")
if not os.path.exists(movies_path):
    print("❌ Error: movies.csv not found!")
    exit(1)

movies = pd.read_csv(movies_path, encoding="utf-8")
movies["title"] = movies["title"].str.lower()  # Convert to lowercase for case-insensitive search

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/recommend", methods=["GET"])
def recommend():
    movie_title = request.args.get("title", "").strip().lower()

    if not movie_title:
        return jsonify({"error": "No movie title provided"}), 400
    
    if movie_title not in movies["title"].values:
        return jsonify({"error": "Movie not found"}), 404

    # Generate simple recommendations (5 random movies)
    recommended_movies = movies[movies["title"] != movie_title].sample(5)["title"].tolist()
    
    return jsonify({"recommended": recommended_movies})

if __name__ == "__main__":
    app.run(debug=True)
