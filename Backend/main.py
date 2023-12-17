from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import threading
import requests
import time

app = Flask(__name__)
CORS(app)

last_update = 0
# Create a lock
lock = threading.Lock()

api_route = "https://overfast-api.tekrop.fr/players/{player_id}/summary"

@app.route("/api/get_json")
def get_json():
    with lock:
        try:
            if request.args.get("local") == "true":
                with open("users.json", "r") as json_file:
                    data = json.load(json_file)
                return jsonify(data)
            else :
                with open("users2.json", "r") as json_file:
                    data = json.load(json_file)
                return jsonify(data)
        except FileNotFoundError:
            return jsonify(message="users.json file not found"), 404
        except Exception as e:
            return jsonify(message=str(e)), 500

@app.route("/api/upload_json", methods=["POST"])
def upload_json():
    if request.method == "POST":
        with lock:
            try:
                if request.args.get("local") == "true":
                    with open("users.json", "w") as json_file:
                        json.dump(request.json, json_file)
                    return jsonify(message="users.json successfully updated")
                else:
                    with open("users2.json", "w") as json_file:
                        json.dump(request.json, json_file)
                    return jsonify(message="users2.json successfully updated")
            except FileNotFoundError:
                return jsonify(message="users.json file not found"), 404
            except Exception as e:
                return jsonify(message=str(e)), 500

@app.route("/api/validate_player_name", methods=["GET"])
def validate_player_name():
    if request.method == "GET":
        try:
            route = api_route.format(player_id=request.args.get("username"))
            player_json = requests.get(route).json()
            if not player_json or "error" in player_json:
                return jsonify(message="Player not found"), 404
            return jsonify(message="Player found")
        except Exception as e:
            return jsonify(message=str(e)), 500

# call the api route for each player by sending get requests to the api
@app.route("/api/get_players")
def get_players():
    global last_update
    if (time.time() - last_update) < 60:
        return jsonify(message="Too many requests"), 429
    last_update = time.time()
    final_json = {}
    # set players to every key of the users2.json file
    players = []
    with open("users2.json", "r") as json_file:
        players = json.load(json_file).keys()
    for player in players:
        route = api_route.format(player_id=player)
        player_json = requests.get(route).json()
        # check if the error key is in the json
        if not player_json or "error" in player_json:
            continue
        final_json[player] = {
            "Tank": {
                "Rank": player_json["competitive"]["pc"]["tank"]["tier"] if player_json["competitive"] and player_json["competitive"]["pc"]["tank"] else "",
                "Tier": player_json["competitive"]["pc"]["tank"]["division"].capitalize() if player_json["competitive"] and player_json["competitive"]["pc"]["tank"] else "",
                "highlighted": False,
            },
            "DPS": {
                "Rank": player_json["competitive"]["pc"]["damage"]["tier"] if player_json["competitive"] and player_json["competitive"]["pc"]["damage"] else "",
                "Tier": player_json["competitive"]["pc"]["damage"]["division"].capitalize() if player_json["competitive"] and player_json["competitive"]["pc"]["damage"] else "",
                "highlighted": False,
            },
            "Support": {
                "Rank": player_json["competitive"]["pc"]["support"]["tier"] if player_json["competitive"] and player_json["competitive"]["pc"]["support"] else "",
                "Tier": player_json["competitive"]["pc"]["support"]["division"].capitalize() if player_json["competitive"] and player_json["competitive"]["pc"]["support"] else "",
                "highlighted": False,
            },
        }
        
    with open("users2.json", "w") as json_file:
        json.dump(final_json, json_file)
    return jsonify(final_json)
    


if __name__ == "__main__":
    app.run(debug=True)
