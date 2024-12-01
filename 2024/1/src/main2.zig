const std = @import("std");
const stdout = std.io.getStdOut().writer();

pub fn main() !void {
    const allocator = std.heap.page_allocator;

    var file = try std.fs.cwd().openFile("inputs.txt", .{});
    defer file.close();

    var buffered = std.io.bufferedReader(file.reader());
    var reader = buffered.reader();

    var list_1 = std.ArrayList(i32).init(allocator);
    var list_2 = std.ArrayList(i32).init(allocator);
    defer list_1.deinit();
    defer list_2.deinit();

    while (reader.readUntilDelimiterOrEofAlloc(allocator, '\n', std.math.maxInt(usize)) catch |err| {
        std.log.err("Failed to read line: {s}", .{@errorName(err)});
        return;
    }) |line| {
        defer allocator.free(line);

        var parts = std.mem.splitSequence(u8, line, "   ");

        const part1 = parts.next() orelse {
            std.log.err("Line is malformed: {s}", .{line});
            return;
        };
        const part2 = parts.next() orelse {
            std.log.err("Line is malformed: {s}", .{line});
            return;
        };

        const value1 = std.fmt.parseInt(i32, @constCast(part1), 10) catch unreachable;
        const value2 = std.fmt.parseInt(i32, @constCast(part2), 10) catch unreachable;

        try list_1.append(value1);
        try list_2.append(value2);
    }

    std.mem.sort(i32, list_1.items, {}, std.sort.asc(i32));
    std.mem.sort(i32, list_2.items, {}, std.sort.asc(i32));

    var sum: u32 = 0;
    for (0.., list_1.items) |idx, num1| {
        const num2 = list_2.items[idx];
        sum += @abs(num1 - num2);
    }

    stdout.print("Result: {d}\n", .{sum}) catch unreachable;
}
