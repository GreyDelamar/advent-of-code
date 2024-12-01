// problem link: https://adventofcode.com/2024/day/1

const std = @import("std");
const stdout = std.io.getStdOut().writer();

const InputParser = struct {
    source: []const u8,
    start: u32,
    current: u32,
    list_number: u32,
    list_1: std.ArrayList(i32),
    list_2: std.ArrayList(i32),

    pub fn init(allocator: std.mem.Allocator, source: []const u8) InputParser {
        return .{ .source = source, .start = 0, .current = 0, .list_number = 1, .list_1 = std.ArrayList(i32).init(allocator), .list_2 = std.ArrayList(i32).init(allocator) };
    }

    pub fn deinit(self: *InputParser) void {
        self.list_1.deinit();
        self.list_2.deinit();
    }

    fn isAtEnd(self: *InputParser) bool {
        return self.current >= self.source.len;
    }

    // consume the next character
    fn advance(self: *InputParser) u8 {
        const char = self.source[self.current];
        self.current += 1;
        return char;
    }

    // lookahead, but don't consume the character
    fn peek(self: *InputParser) u8 {
        if (self.isAtEnd()) return 0;
        return self.source[self.current];
    }

    fn isDigit(char: u8) bool {
        return char >= '0' and char <= '9';
    }

    fn isSpace(char: u8) bool {
        return char == ' ';
    }

    fn scan(self: *InputParser) void {
        const char = self.advance();

        switch (char) {
            // there is are 3 spaces seperating the lists
            ' ' => {
                while (isSpace(self.peek())) _ = self.advance();
                self.list_number += 1;
            },
            // new line so we need to reset the list
            '\n' => self.list_number = 1,

            // grab each digit until there is something other than a digit
            '0'...'9' => {
                while (isDigit(self.peek())) _ = self.advance();

                // now that we found the end of the "number" grab the whole thing
                const number_str = self.source[self.start..self.current];
                const number = std.fmt.parseInt(i32, number_str, 10) catch unreachable;

                if (self.list_number == 1) {
                    self.list_1.append(number) catch unreachable;
                } else {
                    self.list_2.append(number) catch unreachable;
                }
            },
            // if it isn't something we care about ignore it
            else => {},
        }
    }

    pub fn scan_tokens(self: *InputParser) void {
        while (!self.isAtEnd()) {
            self.start = self.current;
            self.scan();
        }
    }
};

pub fn main() !void {
    const file_contents = try std.fs.cwd().readFileAlloc(std.heap.page_allocator, "inputs.txt", std.math.maxInt(usize));
    defer std.heap.page_allocator.free(file_contents);

    var inputParser = InputParser.init(std.heap.page_allocator, file_contents);
    defer inputParser.deinit();

    inputParser.scan_tokens();

    // sort the lists
    std.mem.sort(i32, inputParser.list_1.items, {}, std.sort.asc(i32));
    std.mem.sort(i32, inputParser.list_2.items, {}, std.sort.asc(i32));

    var sum: u32 = 0;
    for (0.., inputParser.list_1.items) |idx, num1| {
        const num2 = inputParser.list_2.items[idx];
        sum += @abs(num1 - num2);
    }

    stdout.print("Result: {d}\n", .{sum}) catch unreachable;
}
