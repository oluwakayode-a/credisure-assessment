from datetime import date

from users.api import month_start


def test_login_returns_token_and_user(client):
    response = client.post("/auth/login", data={"username": "admin@credisure.com", "password": "password123"})
    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["expires_in"] == 3600
    assert body["user"]["email"] == "admin@credisure.com"


def test_login_rejects_wrong_password(client):
    response = client.post("/auth/login", data={"username": "admin@credisure.com", "password": "nope"})
    assert response.status_code == 401


def test_login_rejects_user_without_password(client):
    response = client.post("/auth/login", data={"username": "jordan.lee@northstar.io", "password": "password123"})
    assert response.status_code == 401


def test_protected_routes_require_token(client):
    for path in ["/auth/me", "/overview", "/users"]:
        assert client.get(path).status_code == 401
    assert client.get("/users", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_me(client, auth_headers):
    assert client.get("/auth/me", headers=auth_headers).json()["role"] == "admin"


def test_overview_counts_match_users(client, auth_headers):
    body = client.get("/overview", headers=auth_headers).json()
    assert body["total_users"] == 24
    assert body["active_users"] + body["pending_users"] + body["inactive_users"] == 24
    assert len(body["activity"]) == 7
    assert sum(body["activity"]) <= body["total_users"]


def test_users_pagination(client, auth_headers):
    first = client.get("/users?limit=10&page=1", headers=auth_headers).json()
    last = client.get("/users?limit=10&page=3", headers=auth_headers).json()
    assert first["total"] == 24
    assert len(first["items"]) == 10
    assert len(last["items"]) == 4
    assert first["items"][0]["joined_at"] >= first["items"][-1]["joined_at"]


def test_users_search_matches_name_email_and_company(client, auth_headers):
    for term in ["samira", "northstar.io", "Oak & Stone"]:
        items = client.get("/users", params={"search": term}, headers=auth_headers).json()["items"]
        assert len(items) == 1


def test_users_status_filter(client, auth_headers):
    body = client.get("/users?status=pending&limit=100", headers=auth_headers).json()
    assert body["total"] > 0
    assert all(user["status"] == "pending" for user in body["items"])
    assert client.get("/users?status=bogus", headers=auth_headers).status_code == 422


def test_month_start_crosses_year_boundary():
    assert month_start(date(2026, 2, 17), 3) == date(2025, 11, 1)
    assert month_start(date(2026, 11, 3)) == date(2026, 11, 1)
