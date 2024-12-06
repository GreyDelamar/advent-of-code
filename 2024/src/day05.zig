const std = @import("std");
const ArrayList = std.ArrayList;
const ArenaAllocator = std.heap.ArenaAllocator;

fn compareByRules(rules: *const std.StringHashMap(void), a: u32, b: u32) bool {
    var key_buf: [8]u8 = undefined;
    const key = std.fmt.bufPrint(&key_buf, "{d}|{d}", .{ a, b }) catch unreachable;
    return rules.contains(key);
}

pub fn main() !void {
    var arena = ArenaAllocator.init(std.heap.page_allocator);
    defer arena.deinit();
    const arena_allocator = arena.allocator();

    const file_contents = try std.fs.cwd().readFileAlloc(arena_allocator, "inputs/day05.txt", std.math.maxInt(usize));

    var sections = std.mem.split(u8, file_contents, "\n\n");
    const rules_str = sections.next().?;
    const updates_str = sections.next().?;

    var rules = std.StringHashMap(void).init(arena_allocator);
    var rules_iter = std.mem.split(u8, rules_str, "\n");
    while (rules_iter.next()) |rule| {
        try rules.put(rule, {});
    }

    var updates = ArrayList([]u32).init(arena_allocator);
    var updates_iter = std.mem.split(u8, updates_str, "\n");
    while (updates_iter.next()) |update_line| {
        var nums = ArrayList(u32).init(arena_allocator);

        var num_iter = std.mem.split(u8, update_line, ",");
        while (num_iter.next()) |num_str| {
            const num = try std.fmt.parseInt(u32, num_str, 10);
            try nums.append(num);
        }

        try updates.append(nums.items);
    }

    var total1: u32 = 0;
    var total2: u32 = 0;

    for (updates.items) |update| {
        var sorted = ArrayList(u32).init(arena_allocator);
        try sorted.appendSlice(update);

        std.mem.sort(u32, sorted.items, &rules, compareByRules);

        const are_equal = std.mem.eql(u32, update, sorted.items);
        const mid_idx = update.len / 2;

        if (are_equal) {
            total1 += update[mid_idx];
        } else {
            total2 += sorted.items[mid_idx];
        }
    }

    std.debug.print("total pt1 {}\n", .{total1});
    std.debug.print("total pt2 {}\n", .{total2});
}
