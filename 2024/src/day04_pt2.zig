const std = @import("std");
const stdout = std.io.getStdOut().writer();
const Allocator = std.mem.Allocator;

pub fn readFile(allocator: Allocator, filename: []const u8) ![][]const u8 {
    var file = try std.fs.cwd().openFile(filename, .{});
    defer file.close();
    const file_buffer = try file.readToEndAlloc(allocator, std.math.maxInt(usize));
    var lines = std.ArrayList([]const u8).init(allocator);
    var iter = std.mem.splitAny(u8, file_buffer, "\n");
    while (iter.next()) |line| try lines.append(line);
    return lines.items;
}

pub fn main() !void {
    const lines = readFile(std.heap.page_allocator, "inputs/day04.txt") catch unreachable;
    defer std.heap.page_allocator.free(lines);

    const height = lines.len;
    const width = lines[0].len;
    var total: u32 = 0;

    // skip the first line and last line
    for (1..height - 1) |y| {
        // skip fist char and last char
        for (1..width - 1) |x| {
            const char = lines[y][x];

            if (char == 'A') {
                const bottomLeft = lines[y + 1][x - 1];
                const topleft = lines[y - 1][x - 1];
                const topRight = lines[y - 1][x + 1];
                const bottomRight = lines[y + 1][x + 1];

                const forwardSlash = (topRight == 'M' and bottomLeft == 'S') or (topRight == 'S' and bottomLeft == 'M');
                const backSlash = (topleft == 'M' and bottomRight == 'S') or (topleft == 'S' and bottomRight == 'M');

                if (forwardSlash and backSlash) {
                    total += 1;
                }
            }
        }
    }

    stdout.print("Total: {d}\n", .{total}) catch unreachable;
}
