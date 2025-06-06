import subprocess
import sys
import argparse

def generate_nest_components(resource_name):
    commands = [
        f"nest generate module {resource_name}",
        f"nest generate controller {resource_name}",
        f"nest generate service {resource_name}"
    ]

    try:
        print(f"\n🚀 Generating NestJS components for '{resource_name}'...")
        for cmd in commands:
            print(f"\nExecuting: {cmd}")
            result = subprocess.run(
                cmd.split(),
                check=True,
                text=True,
                capture_output=True
            )
            print(result.stdout)
            if result.stderr:
                print("Warning:", result.stderr, file=sys.stderr)
        
        print(f"\n✅ Successfully generated all components for '{resource_name}'!")
        return 0
    
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Command failed: {e.cmd}")
        print("Return code:", e.returncode)
        print("Output:", e.stdout)
        print("Error:", e.stderr, file=sys.stderr)
        return 1

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Automate NestJS component generation",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "resource",
        help="Name of the resource to generate (e.g. 'member' or 'user')"
    )
    args = parser.parse_args()
    
    sys.exit(generate_nest_components(args.resource))