#git clone https://github.com/derDere/bee-bee.git
#cd bee-bee
mkdir certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs\\key.pem -out certs\\cert.pem -subj "/CN=localhost"
docker compose up -d -p bee-bee