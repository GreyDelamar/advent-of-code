const std = @import("std");
const timer = std.time.Timer;

const stdout = std.io.getStdOut().writer();

const InputTokenizer = struct {
    source: []const u8,
    start: u32,
    current: u32,
    line_number: u32,
    total: i32,

    pub fn init(source: []const u8) InputTokenizer {
        return .{ .source = source, .start = 0, .current = 0, .line_number = 1, .total = 0 };
    }

    fn isAtEnd(self: *InputTokenizer) bool {
        return self.current >= self.source.len;
    }

    // consume the next character
    fn advance(self: *InputTokenizer) u8 {
        const char = self.source[self.current];
        self.current += 1;
        return char;
    }

    // lookahead, but don't consume the character
    fn peek(self: *InputTokenizer) u8 {
        if (self.isAtEnd()) return 0;
        return self.source[self.current];
    }

    fn isDigit(char: u8) bool {
        return char >= '0' and char <= '9';
    }

    fn isSpace(char: u8) bool {
        return char == ' ';
    }

    fn is_U_Or_L(char: u8) bool {
        return char == 'u' or char == 'l';
    }

    fn scan(self: *InputTokenizer) void {
        const char = self.advance();

        switch (char) {
            // new line so we need to reset the list
            '\n' => self.line_number = 1,

            'm' => {
                // looking for "mul"
                while (is_U_Or_L(self.peek())) _ = self.advance();

                const left_paren = self.source[self.current];
                if (left_paren != '(') {
                    return;
                }
                // consume paren
                _ = self.advance();

                const identifierText = self.source[self.start..self.current];
                if (!std.mem.eql(u8, identifierText, "mul(")) {
                    return;
                }

                var number1: i32 = 0;
                while (isDigit(self.peek())) {
                    number1 = number1 * 10 + (self.advance() - '0');
                }

                const comma = self.source[self.current];
                if (comma != ',') {
                    return;
                }
                // consume comma
                _ = self.advance();

                var number2: i32 = 0;
                while (isDigit(self.peek())) {
                    number2 = number2 * 10 + (self.advance() - '0');
                }

                const right_paren = self.source[self.current];
                if (right_paren != ')') {
                    return;
                }

                self.total += (number1 * number2);
            },
            // if it isn't something we care about ignore it
            else => {},
        }
    }

    pub fn scan_tokens(self: *InputTokenizer) void {
        while (!self.isAtEnd()) {
            self.start = self.current;
            self.scan();
        }
    }
};

pub fn main() !void {
    const file_contents = try std.fs.cwd().readFileAlloc(std.heap.page_allocator, "inputs/day03.txt", std.math.maxInt(usize));
    defer std.heap.page_allocator.free(file_contents);

    var inputTokenizer = InputTokenizer.init(file_contents);

    inputTokenizer.scan_tokens();

    stdout.print("Total: {d}\n", .{inputTokenizer.total}) catch unreachable;
}
