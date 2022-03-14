if ! screen -list | grep -q 'd6'; then
  echo 'd6 already killed'
  exit 1
else
  echo "killing d6"
fi
. /media/sda1/deployment/ports.sh
screen -S 'd6' -X quit
echo "Checking if d6 still alive..."
lsof -i:$d6