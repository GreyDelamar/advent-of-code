const std = @import("std");
const timer = std.time.Timer;

const stdout = std.io.getStdOut().writer();

const TokenType = enum {
    do,
    dont,
    mul,
};

const Token = struct {
    ttype: TokenType,
    args: []i32,
};

const InputTokenizer = struct {
    source: []const u8,
    start: u32,
    current: u32,
    line_number: u32,
    tokens: std.ArrayList(Token),

    pub fn init(allocator: std.mem.Allocator, source: []const u8) InputTokenizer {
        return .{ .source = source, .start = 0, .current = 0, .line_number = 1, .tokens = std.ArrayList(Token).init(allocator) };
    }

    pub fn deinit(self: *InputTokenizer) void {
        self.tokens.deinit();
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

    fn peekAhead(self: *InputTokenizer, amt: u32) u8 {
        if (self.isAtEnd() or self.current + amt >= self.source.len) return 0;
        return self.source[self.current + amt];
    }

    fn isDigit(char: u8) bool {
        return char >= '0' and char <= '9';
    }

    fn is_U_Or_L(char: u8) bool {
        return char == 'u' or char == 'l';
    }

    fn is_left_paren(char: u8) bool {
        return char == '(';
    }

    fn is_right_paren(char: u8) bool {
        return char == ')';
    }

    fn getArgs(self: *InputTokenizer) []i32 {
        const left_paren = self.source[self.current];
        if (left_paren != '(') {
            return &[_]i32{};
        }
        // consume paren
        _ = self.advance();

        var number1: ?i32 = null;

        while (isDigit(self.peek())) {
            number1 = if (number1) |n| n * 10 + (self.advance() - '0') else (self.advance() - '0');
        }

        const comma = self.peek();
        if (comma != ',' and number1 != null) {
            return &[_]i32{};
        } else if (comma == ',') {
            _ = self.advance();
        }

        var number2: ?i32 = null;
        while (isDigit(self.peek())) {
            number2 = if (number2) |n| n * 10 + (self.advance() - '0') else (self.advance() - '0');
        }

        const right_paren = self.source[self.current];
        if (right_paren != ')') {
            return &[_]i32{};
        }
        _ = self.advance();

        var result = self.tokens.allocator.alloc(i32, 2) catch unreachable;
        if (number1 != null and number2 != null) {
            result[0] = number1 orelse 0;
            result[1] = number2 orelse 0;
        }

        return result;
    }

    fn scan(self: *InputTokenizer) void {
        const char = self.advance();

        switch (char) {
            // new line so we need to reset the list
            '\n' => self.line_number = 1,

            // looking for do & don't
            'd', 'm' => {
                while ((self.peek() >= 'a' and self.peek() <= 'z') or self.peek() == '\'') _ = self.advance();

                const identifierText = self.source[self.start..self.current];

                if (!is_left_paren(self.peek())) {
                    return;
                }
                stdout.print("identifierText {c}\n", .{identifierText}) catch unreachable;

                if (std.mem.eql(u8, identifierText, "do")) {
                    const args = self.getArgs();

                    if (!is_right_paren(self.source[self.current - 1])) {
                        return;
                    }

                    self.tokens.append(.{ .ttype = TokenType.do, .args = args }) catch unreachable;
                } else if (std.mem.eql(u8, identifierText, "don't")) {
                    const args = self.getArgs();

                    if (!is_right_paren(self.source[self.current - 1])) {
                        return;
                    }

                    self.tokens.append(.{ .ttype = TokenType.dont, .args = args }) catch unreachable;
                } else if (std.mem.eql(u8, identifierText, "mul")) {
                    const args = self.getArgs();

                    if (!is_right_paren(self.source[self.current - 1])) {
                        return;
                    }

                    self.tokens.append(.{ .ttype = TokenType.mul, .args = args }) catch unreachable;
                }
            },
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

    var inputTokenizer = InputTokenizer.init(std.heap.page_allocator, file_contents);
    defer inputTokenizer.deinit();

    inputTokenizer.scan_tokens();

    var total: i32 = 0;
    var skipping = false;
    for (inputTokenizer.tokens.items) |tk| {
        if (tk.ttype == TokenType.do) {
            skipping = false;
            continue;
        }

        if (tk.ttype == TokenType.dont or skipping) {
            skipping = true;
            continue;
        }

        total += tk.args[0] * tk.args[1];
    }

    stdout.print("Total: {d}\n", .{total}) catch unreachable;
}
