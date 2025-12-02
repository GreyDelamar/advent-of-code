#!/bin/bash

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <n> <command>"
  echo "Example: $0 10 'ls -l'"
  exit 1
fi

n=$1
shift
cmd="$@"

# Array to store durations
durations=()

# Function to detect available language for nanosecond timing
detect_timer() {
  if command -v python3 &>/dev/null; then
    echo "python3"
  elif command -v node &>/dev/null; then
    echo "node"
  # elif command -v php &>/dev/null; then
  #   echo "php"
  else
    echo "error"
  fi
}

# Function to get current time in nanoseconds
get_time_ns() {
  case $timer in
  python3)
    python3 -c '
import time
import sys
import subprocess
cmd = " ".join(sys.argv[1:])
start = time.perf_counter_ns()
subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
end = time.perf_counter_ns()
duration = end - start
print(duration)
' "$@"
    ;;
  node)
    node -e '
const { execSync } = require("child_process");
const cmd = process.argv.slice(1).join(" ");
const start = process.hrtime.bigint();
execSync(cmd, {stdio: "ignore"});
const end = process.hrtime.bigint();
console.log(Number(end - start));
' "$@"
    ;;
  *)
    echo "No suitable language found for nanosecond timing!" >&2
    exit 1
    ;;
  esac
}

# Detect available timer
timer=$(detect_timer)
if [[ $timer == "error" ]]; then
  echo "Error: Python3, Node.js, or PHP is required but not found."
  exit 1
fi

echo "Using $timer for nanosecond precision timing."
echo "Running command '$cmd' $n times..."

# Run the command n times and measure time
for ((i = 1; i <= n; i++)); do
  # Get duration directly instead of start/end times
  if ! duration=$(get_time_ns "$cmd"); then
    echo "Error running command. Exiting."
    exit 1
  fi
  durations+=("$duration")
done

# Calculate statistics
total=0
min=${durations[0]}
max=${durations[0]}

for d in "${durations[@]}"; do
  ((total += d))
  ((d < min)) && min=$d
  ((d > max)) && max=$d
done

avg=$((total / n))

# Sort durations
IFS=$'\n' sorted=($(sort -n <<<"${durations[*]}"))
unset IFS

p90=${sorted[$((n * 90 / 100 - 1))]}
p95=${sorted[$((n * 95 / 100 - 1))]}
p99=${sorted[$((n * 99 / 100 - 1))]}

# Convert nanoseconds to milliseconds for display
convert_ns_to_ms() {
  printf "%.3f\n" "$(echo "$1 / 1000000" | bc -l)"
}

echo "Statistics:"
echo "  Total time: $(convert_ns_to_ms $total) ms"
echo "  Min time: $(convert_ns_to_ms $min) ms"
echo "  Max time: $(convert_ns_to_ms $max) ms"
echo "  Avg time: $(convert_ns_to_ms $avg) ms"
echo "  P90: $(convert_ns_to_ms $p90) ms"
echo "  P95: $(convert_ns_to_ms $p95) ms"
echo "  P99: $(convert_ns_to_ms $p99) ms"