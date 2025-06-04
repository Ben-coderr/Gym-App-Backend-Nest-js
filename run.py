import subprocess
import time
import sys
import os
from datetime import datetime

# Configuration
CONTAINER_NAME = "gym-postgres"
COMPOSE_FILE = "./docker-compose.yml"
PRISMA_MIGRATE_CMD = "npx prisma migrate dev --name init"
PRISMA_GENERATE_CMD = "npx prisma generate"
PRISMA_SEED_CMD = "npx prisma db seed"
DEV_SERVER_CMD = "pnpm start:dev"

# Color codes
COLOR = {
    "HEADER": "\033[95m",
    "BLUE": "\033[94m",
    "CYAN": "\033[96m",
    "GREEN": "\033[92m",
    "YELLOW": "\033[93m",
    "RED": "\033[91m",
    "RESET": "\033[0m"
}

def print_status(emoji, color, step, message):
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{color}{emoji} [{timestamp}] {step}: {message}{COLOR['RESET']}")

def run_command(command, step):
    try:
        process = subprocess.Popen(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Stream output in real-time
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                print(f"    {output.strip()}")
        
        # Check for errors after completion
        returncode = process.poll()
        if returncode != 0:
            raise subprocess.CalledProcessError(returncode, command)
            
        print_status("✅", COLOR["GREEN"], step, "Completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print_status("❌", COLOR["RED"], step, "Failed")
        print(f"Command: {e.cmd}")
        print(f"Exit code: {e.returncode}")
        sys.exit(1)

def cleanup_environment():
    print_status("🧹", COLOR["YELLOW"], "CLEANUP", "Removing existing containers")
    run_command(f"docker-compose -f {COMPOSE_FILE} down --volumes", "Docker Cleanup")

def start_postgres():
    print_status("🐘", COLOR["BLUE"], "DATABASE", "Starting PostgreSQL")
    run_command(f"docker-compose -f {COMPOSE_FILE} up -d postgres", "Docker Start")
    time.sleep(2)

def wait_for_postgres():
    print_status("⏳", COLOR["CYAN"], "DATABASE", "Waiting for PostgreSQL readiness")
    spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    timeout = 30
    start_time = time.time()
    i = 0

    while time.time() - start_time < timeout:
        result = subprocess.run(
            f"docker exec {CONTAINER_NAME} pg_isready -U admin",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        if result.returncode == 0:
            print("\n", end="")
            print_status("✅", COLOR["GREEN"], "DATABASE", "PostgreSQL ready")
            return
        
        # Display spinner
        sys.stdout.write(f"\r{spinner[i % len(spinner)]} Checking database connection...")
        sys.stdout.flush()
        i += 1
        time.sleep(0.1)

    print("\n", end="")
    print_status("❌", COLOR["RED"], "DATABASE", "PostgreSQL not ready within 30s")
    sys.exit(1)

def install_dependencies():
    print_status("📦", COLOR["CYAN"], "DEPENDENCIES", "Installing Prisma and dependencies")
    if not os.path.exists("node_modules"):
        run_command("pnpm install", "Dependency Installation")
    else:
        print_status("ℹ️", COLOR["CYAN"], "DEPENDENCIES", "node_modules already exists")

def run_migrations():
    print_status("📦", COLOR["CYAN"], "MIGRATIONS", "Running database migrations")
    run_command(PRISMA_MIGRATE_CMD, "Prisma Migrate")

def generate_client():
    print_status("⚙️", COLOR["CYAN"], "PRISMA", "Generating Prisma Client")
    run_command(PRISMA_GENERATE_CMD, "Prisma Generate")

def seed_database():
    print_status("🌱", COLOR["GREEN"], "SEEDING", "Populating initial data")
    run_command(PRISMA_SEED_CMD, "Prisma Seed")

def start_application():
    print_status("🚀", COLOR["HEADER"], "APPLICATION", "Starting NestJS development server")
    try:
        subprocess.run(
            DEV_SERVER_CMD,
            shell=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        print_status("💥", COLOR["RED"], "APPLICATION", "Server crashed")
    except KeyboardInterrupt:
        print_status("🛑", COLOR["YELLOW"], "APPLICATION", "Server stopped by user")

def main():
    try:
        print(f"\n{COLOR['HEADER']}💪 Gym Management System Initialization{COLOR['RESET']}")
        cleanup_environment()
        start_postgres()
        wait_for_postgres()
        install_dependencies()  # Added dependency installation
        run_migrations()
        generate_client()
        seed_database()
        start_application()
    except KeyboardInterrupt:
        print_status("🛑", COLOR["YELLOW"], "SYSTEM", "Process interrupted by user")
        cleanup_environment()

if __name__ == "__main__":
    main()