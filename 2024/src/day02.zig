const std = @import("std");
const stdout = std.io.getStdOut().writer();

const InputParser = struct {
    allocator: std.mem.Allocator,
    numbers: std.ArrayList(std.ArrayList(i32)),

    pub fn init(allocator: std.mem.Allocator) InputParser {
        return .{ .allocator = allocator, .numbers = std.ArrayList(std.ArrayList(i32)).init(allocator) };
    }

    pub fn deinit(self: *InputParser) void {
        self.numbers.deinit();
    }

    pub fn parseFile(self: *InputParser, content: []const u8) void {
        var lines = std.mem.split(u8, content, "\n");

        while (lines.next()) |line| {
            var numberList = std.ArrayList(i32).init(self.allocator);
            var numbers = std.mem.tokenize(u8, line, " ");

            while (numbers.next()) |num| {
                const parsed = std.fmt.parseInt(i32, num, 10) catch continue;
                numberList.append(parsed) catch continue;
            }

            if (numberList.items.len > 0) {
                self.numbers.append(numberList) catch continue;
            }
        }
    }
};

fn isValidSequence(numbers: []const i32) bool {
    if (numbers.len < 2) return false;

    const isDecreasing = numbers[0] > numbers[1];
    var prev = numbers[0];

    for (numbers[1..]) |num| {
        const diff = @abs(num - prev);
        if (diff < 1 or diff > 3) return false;

        if (isDecreasing and num >= prev) return false;
        if (!isDecreasing and num <= prev) return false;

        prev = num;
    }
    return true;
}

pub fn main() !void {
    const file_contents = try std.fs.cwd().readFileAlloc(std.heap.page_allocator, "inputs/day02.txt", std.math.maxInt(usize));
    defer std.heap.page_allocator.free(file_contents);

    var parser = InputParser.init(std.heap.page_allocator);
    defer parser.deinit();

    parser.parseFile(file_contents);

    var safe_count: i32 = 0;
    for (parser.numbers.items) |sequence| {
        if (isValidSequence(sequence.items)) {
            safe_count += 1;
        }
    }

    try stdout.print("safe_count {d}\n", .{safe_count});
}
