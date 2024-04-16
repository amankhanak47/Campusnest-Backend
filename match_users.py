import psycopg2
import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import sys

def clean_text(text):
    text = re.sub("[^a-zA-Z0-9 ]", "", text)
    return text

def create_tfidf_vectorizer(data):
    # Convert integer values to strings
    data = data.astype(str)
    # Initialize an empty DataFrame to store TF-IDF scores for each attribute
    tfidf_dfs = {}
    # Define columns for which to calculate TF-IDF
    columns_to_tokenize = ["id", "age", "gender","college_name", "course", "interests", "hobbies", "degree", "state", "country", "pincode", "address"]
    for column in columns_to_tokenize:
        # Clean text and tokenize
        data[column] = data[column].apply(clean_text)
        # Vectorize the cleaned text for this attribute
        vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform(data[column])
        # Store vectorizer and matrix
        tfidf_dfs[column] = {"vectorizer": vectorizer, "matrix": tfidf_matrix}
    return tfidf_dfs

def search(query, vectorizers, tfidf_matrices, data):
    # Initialize an array to store individual attribute similarities
    similarities = []
    for column in vectorizers:
        query_vec = vectorizers[column]["vectorizer"].transform([query])
        # Calculate cosine similarity for each attribute
        similarity = cosine_similarity(query_vec, tfidf_matrices[column]["matrix"]).flatten()
        similarities.append(similarity)
    # Combine individual attribute similarities
    combined_similarity = np.mean(similarities, axis=0)
    # Find indices of top matches
    indices = np.argsort(combined_similarity)[::-1][:5]
    results = data.iloc[indices].iloc[::-1]
    # Calculate matching percentage
    results["matching_percentage"] = (combined_similarity[indices] * 100).round(2)
    return results

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python match_users.py <query>")
        sys.exit(1)

    query = sys.argv[1]

    # Connect to PostgreSQL database
    conn = psycopg2.connect(
        dbname="campusnest_usa",
        user="campusnest_usa_user",
        password="NF6HqarNcbiZBWVcz1rDqF9SfCcwh5Xk",
        host="dpg-cof8t5i1hbls739929bg-a.oregon-postgres.render.com/",
    )
    cur = conn.cursor()

    # Load user data from PostgreSQL
    cur.execute("SELECT id, age, gender, college_name, course, interests, hobbies, degree, state, country, pincode, address FROM users")
    users_data = cur.fetchall()
    users_df = pd.DataFrame(users_data, columns=[ "id", "age", "gender", "college_name", "course", "interests", "hobbies", "degree", "state", "country", "pincode", "address"])

    # Close database connection
    cur.close()
    conn.close()

    # Process user matching
    vectorizers = create_tfidf_vectorizer(users_df)
    results = search(query, vectorizers, vectorizers, users_df)

    # Format the results as JSON
    response = results.to_json(orient='records')

    # Print the response
    print(response)
