#git clone https://github.com/derDere/bee-bee.git
#cd bee-bee
mkdir certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs\\key.pem -out certs\\cert.pem -subj "/CN=localhost"
docker compose -p bee-bee down
git pull
docker compose -p bee-bee build
docker compose -p bee-bee up -d