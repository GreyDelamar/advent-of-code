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
    python3 -c 'import time; print(time.time_ns())'
    ;;
  node)
    node -e 'const [s, ns] = process.hrtime(); console.log(s * 1e9 + ns);'
    ;;
  # php)
  #   php -r 'echo hrtime(true);'
  #   ;;
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
  start=$(get_time_ns)
  eval "$cmd" &>/dev/null
  end=$(get_time_ns)
  duration=$((end - start))
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

# Convert nanoseconds to seconds for display
convert_ns_to_seconds() {
  printf "%.6f\n" "$(echo "$1 / 1000000000" | bc -l)"
}

echo "Statistics:"
echo "  Total time: $(convert_ns_to_seconds $total) seconds"
echo "  Min time: $(convert_ns_to_seconds $min) seconds"
echo "  Max time: $(convert_ns_to_seconds $max) seconds"
echo "  Avg time: $(convert_ns_to_seconds $avg) seconds"
echo "  P90: $(convert_ns_to_seconds $p90) seconds"
echo "  P95: $(convert_ns_to_seconds $p95) seconds"
echo "  P99: $(convert_ns_to_seconds $p99) seconds"