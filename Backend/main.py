from flask import Flask, jsonify, request
from flask_cors import CORS  # import CORS
import json

app = Flask(__name__)
CORS(app)  # enable CORS

@app.route("/api/get_json")
def get_json():
    try:
        with open("users.json", "r") as json_file:
            data = json.load(json_file)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify(message="users.json file not found"), 404
    except Exception as e:
        return jsonify(message=str(e)), 500

# post a json file to the server
@app.route("/api/upload_json", methods=["POST"])
def upload_json():
    print(request.json)
    if request.method == "POST":
        try:
            with open("users.json", "w") as json_file:
                json.dump(request.json, json_file)
            return jsonify(message="users.json successfully updated")
        except FileNotFoundError:
            return jsonify(message="users.json file not found"), 404
        except Exception as e:
            return jsonify(message=str(e)), 500

if __name__ == "__main__":
    app.run(debug=True)