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

    for (0..height) |y| {
        for (0..width) |x| {
            const char = lines[y][x];
            if (char == 'X') {
                // check right
                if (x + 4 <= width and std.mem.eql(u8, lines[y][x .. x + 4], "XMAS")) {
                    total += 1;
                }

                // check left
                if (x >= 3 and std.mem.eql(u8, lines[y][x - 3 .. x], "SAM")) {
                    total += 1;
                }

                if (y + 4 <= height) {
                    // check down
                    if (lines[y + 1][x] == 'M' and lines[y + 2][x] == 'A' and lines[y + 3][x] == 'S') {
                        total += 1;
                    }

                    // check down right
                    if (x + 3 <= width and lines[y + 1][x + 1] == 'M' and lines[y + 2][x + 2] == 'A' and lines[y + 3][x + 3] == 'S') {
                        total += 1;
                    }

                    // check down left
                    if (x >= 3 and lines[y + 1][x - 1] == 'M' and lines[y + 2][x - 2] == 'A' and lines[y + 3][x - 3] == 'S') {
                        total += 1;
                    }
                }

                if (y >= 3) {
                    // check up
                    if (lines[y - 1][x] == 'M' and lines[y - 2][x] == 'A' and lines[y - 3][x] == 'S') {
                        total += 1;
                    }

                    // check up right
                    if (x + 3 <= width and lines[y - 1][x + 1] == 'M' and lines[y - 2][x + 2] == 'A' and lines[y - 3][x + 3] == 'S') {
                        total += 1;
                    }

                    // check up left
                    if (x >= 3 and lines[y - 1][x - 1] == 'M' and lines[y - 2][x - 2] == 'A' and lines[y - 3][x - 3] == 'S') {
                        total += 1;
                    }
                }
            }
        }
    }

    stdout.print("Total: {d}\n", .{total}) catch unreachable;
}
