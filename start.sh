if screen -list | grep -q "d6"; then
  echo "d6 already started"
  exit 1
else
  echo "starting d6"
fi

. /media/sda1/deployment/ports.sh

# Start node server
screen -dmS 'd6'
screen -S 'd6' -X stuff "cd server && node .\n"

echo "Checking if node started..."
lsof -i:$d6

# Build vue client
yarn build