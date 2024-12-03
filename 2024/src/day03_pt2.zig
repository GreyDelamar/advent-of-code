const std = @import("std");
const stdout = std.io.getStdOut().writer();

const TokenType = enum {
    do,
    dont,
    mul,
};

const Args = struct {
    x: i32,
    y: i32,
};

const Token = struct { ttype: TokenType, args: ?Args };

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

    fn isDigit(char: u8) bool {
        return char >= '0' and char <= '9';
    }

    // Parses a sequence of digits into a number
    fn parseNumber(self: *InputTokenizer) ?i32 {
        var number: ?i32 = null;
        while (isDigit(self.peek())) {
            number = if (number) |n| n * 10 + (self.advance() - '0') else (self.advance() - '0');
        }
        return number;
    }

    // Parses arguments in the format (x,y)
    fn parseArgs(self: *InputTokenizer) ?Args {
        if (self.peek() != '(') return null;
        _ = self.advance();

        const x = self.parseNumber() orelse return null;

        if (self.peek() != ',') return null;
        _ = self.advance();

        const y = self.parseNumber() orelse return null;

        if (self.peek() != ')') return null;
        _ = self.advance();

        return .{ .x = x, .y = y };
    }

    fn scan(self: *InputTokenizer) void {
        const char = self.advance();

        switch (char) {
            '\n' => self.line_number = 1,
            'd', 'm' => {
                // Consume the rest of the identifier
                while ((self.peek() >= 'a' and self.peek() <= 'z') or self.peek() == '\'') _ = self.advance();
                const identifier = self.source[self.start..self.current];

                // Map identifiers to token types
                const token_type: ?TokenType = if (std.mem.eql(u8, identifier, "do"))
                    .do
                else if (std.mem.eql(u8, identifier, "don't"))
                    .dont
                else if (std.mem.eql(u8, identifier, "mul"))
                    .mul
                else
                    null;

                if (token_type) |tt| {
                    const args = self.parseArgs();

                    self.tokens.append(.{
                        .ttype = tt,
                        .args = args,
                    }) catch unreachable;
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
    var skip_mode = false;

    for (inputTokenizer.tokens.items) |token| {
        switch (token.ttype) {
            .do => skip_mode = false,
            .dont => skip_mode = true,
            .mul => if (!skip_mode) {
                if (token.args) |args| {
                    total += args.x * args.y;
                }
            },
        }
    }

    try stdout.print("Total: {d}\n", .{total});
}
