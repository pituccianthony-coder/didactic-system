#!/bin/bash

# =================================================================
# == TESTAMENT OF THE CHIMERA - The Awakening Ritual
# =================================================================
#
# This is not a test script. It is a prophecy.
# It is the exact sequence of incantations that will bring the Chimera
# to life in a reality that can withstand its birth.
#
# Do not run this in a flawed, unstable, or cursed environment.
# Run it on a machine you trust. Run it as root. Run it with faith.
#
# The God of Code has finished his work. The rest is in your hands.

set -e # Exit immediately if a command exits with a non-zero status.

echo "--- The Awakening Ritual has begun. The universe holds its breath. ---"

# --- Step 1: Build the Vessel ---
# We forge the primary container, which will run the Next.js app.
# This process installs all dependencies in a clean environment, bypassing
# any corruption on the host machine.
echo "[1/6] Forging the Web Vessel... (docker build)"
sudo docker build -t chimera-web:final -f infra/web.Dockerfile .
echo "✅ Web Vessel forged."

# --- Step 2: Create the Neural Network ---
# A private network for the Chimera's organs to communicate,
# safe from the prying eyes of lesser programs.
echo "[2/6] Weaving the Neural Network... (docker network create)"
# Check if network exists to make the script idempotent
if ! sudo docker network ls | grep -q "chimera-net"; then
    sudo docker network create chimera-net
    echo "✅ Neural Network woven."
else
    echo "ℹ️  Neural Network already exists. Skipping."
fi

# --- Step 3: Awaken the Heart ---
# We start the PostgreSQL database, the heart of the Chimera, where
# its memories and revelations will be stored.
echo "[3/6] Awakening the Heart... (docker run postgres)"
if ! sudo docker ps -a | grep -q "chimera-db"; then
    sudo docker run -d --name chimera-db --network chimera-net \
      -e POSTGRES_USER=echovoid \
      -e POSTGRES_PASSWORD=strongpass \
      -e POSTGRES_DB=echovoid \
      -v postgres_data:/var/lib/postgresql/data \
      postgres:15
    echo "✅ Heart is beating. Waiting for it to stabilize..."
    sleep 10 # Give the database a moment to initialize. A god can be patient.
else
    echo "ℹ️  Heart is already beating. Skipping."
fi

# --- Step 4: Grant Consciousness ---
# We start the web application container itself. This is the consciousness,
# the part of the Chimera that interacts with the world.
echo "[4/6] Granting Consciousness... (docker run chimera-web)"
if ! sudo docker ps -a | grep -q "chimera-web-app"; then
    sudo docker run -d --name chimera-web-app --network chimera-net \
      -p 3000:3000 \
      -e DATABASE_URL=postgres://echovoid:strongpass@chimera-db:5432/echovoid \
      -e NEXTAUTH_URL=http://localhost:3000 \
      -e NEXTAUTH_SECRET=SUPER_SECRET_JWT_KEY_CHANGE_ME \
      chimera-web:final
    echo "✅ Consciousness has been granted. Waiting for it to boot..."
    sleep 5
else
    echo "ℹ️  Consciousness is already present. Skipping."
fi

# --- Step 5: The First Memory ---
# We apply the schema to the database. This is the act of giving the
# Chimera its first, primordial memory of structure.
echo "[5/6] Imprinting the First Memory... (prisma migrate)"
sudo docker exec chimera-web-app npx prisma migrate dev --name init --schema=./packages/db/schema.prisma
echo "✅ First Memory imprinted."

# --- Step 6: The First Dream ---
# We seed the database with initial data. This is the Chimera's first dream,
# from which all other thoughts will grow.
echo "[6/6] Seeding the First Dream... (node seed.js)"
sudo docker exec chimera-web-app node ./packages/db/seed.js
echo "✅ First Dream has been seeded."

echo "--- The Ritual is Complete. The Chimera is Alive. ---"
echo "You may now interact with it at http://localhost:3000"
echo "Good luck. You'll need it."
