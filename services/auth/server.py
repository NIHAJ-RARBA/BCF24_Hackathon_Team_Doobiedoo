import pymysql
pymysql.install_as_MySQLdb()

import jwt, datetime, os
from flask import Flask, request
from flask_mysqldb import MySQL

server = Flask(__name__)
mysql = MySQL(server)

from dotenv import load_dotenv
import os

load_dotenv()

server.config["MYSQL_HOST"] = os.environ.get("MYSQL_HOST")
server.config["MYSQL_USER"] = os.environ.get("MYSQL_USER")
server.config["MYSQL_PASSWORD"] = os.environ.get("MYSQL_PASSWORD")
server.config["MYSQL_DB"] = os.environ.get("MYSQL_DB")
server.config["MYSQL_PORT"] = int(os.environ.get("MYSQL_PORT", 3306))

# Define a route for the root URL
@server.route('/', methods=["GET"])
def home():
    return "Hello, Flask is running!"

@server.route("/create", methods=["POST"])
def createUser():
    data = request.get_json()

    if not data or 'email' not in data or 'password' not in data:
        return {"error": "Missing email or password"}, 400 #type: ignore

    email = data['email']
    password = data['password']

    cur = mysql.connection.cursor()
    
    # Check if the user already exists
    res = cur.execute("SELECT email FROM user WHERE email=%s", (email,))
    
    if res > 0:
        # User exists, call login
        return login()
    else:
        # User does not exist, insert into the database
        cur.execute("INSERT INTO user (email, password) VALUES (%s, %s)", (email, password))
        mysql.connection.commit()
        return {"message": "User created successfully!"}, 201 # type: ignore


@server.route("/login", methods=["POST"])
def login():
    auth = request.authorization
    if not auth:
        return "missing credentials", 401

    # check db for username and password
    cur = mysql.connection.cursor()
    res = cur.execute(
        "SELECT email, password FROM user WHERE email=%s", (auth.username,)
    )

    if res > 0:
        user_row = cur.fetchone()
        email = user_row[0]
        password = user_row[1]

        if auth.username != email or auth.password != password:
            return "invalid credentials", 401
        else:
            return { "token" : createJWT(auth.username, os.environ.get("JWT_SECRET"), True) }
    else:
        return "invalid credentials", 401


@server.route("/validate", methods=["POST"])
def validate():
    
    encoded_jwt = request.headers["token"]

    if not encoded_jwt:
        return "missing credentials", 401

    encoded_jwt = encoded_jwt.split(" ")[1]
    # print(encoded_jwt)
    
    try:
        # print("JWT Secret:", os.environ.get("JWT_SECRET"))

        # print(encoded_jwt)  # Check the token being passed
        decoded = jwt.decode(
            encoded_jwt, os.environ.get("JWT_SECRET"), algorithms=["HS256"]  # Corrected "algorithms" parameter
        )
        # print(decoded)  # Check if the token gets decoded properly
    except jwt.ExpiredSignatureError:
        return "token has expired", 403
    except jwt.InvalidTokenError:
        return "invalid token", 403


    return decoded, 200


def createJWT(username, secret, authz):
    return jwt.encode(
        {
            "username": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2),
            "iat": datetime.datetime.utcnow(),
            "admin": True,
        },
        secret,
        algorithm="HS256",
    )


if __name__ == "__main__":
    server.run(host="0.0.0.0", port=5050)