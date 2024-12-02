const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Scan src directory for day files
    var src_dir = std.fs.cwd().openDir("src", .{ .iterate = true }) catch |err| {
        std.debug.print("Failed to open src directory: {}\n", .{err});
        return;
    };
    defer src_dir.close();

    var dir_it = src_dir.iterate();
    while (dir_it.next() catch null) |entry| {
        if (entry.kind != .file) continue;

        // Check if file matches pattern "dayXX.zig"
        if (std.mem.startsWith(u8, entry.name, "day") and std.mem.endsWith(u8, entry.name, ".zig")) {
            const day_name = entry.name[0 .. entry.name.len - 4]; // Remove .zig extension
            const file_path = std.fs.path.join(b.allocator, &[_][]const u8{ "src", entry.name }) catch unreachable;
            const exe = b.addExecutable(.{
                .name = b.fmt("{s}.exe", .{day_name}),
                .root_source_file = b.path(file_path),
                .target = target,
                .optimize = optimize,
            });

            // This declares intent for the executable to be installed into the
            // standard location when the user invokes the "install" step (the default
            // step when running `zig build`).
            b.installArtifact(exe);

            // This *creates* a Run step in the build graph, to be executed when another
            // step is evaluated that depends on it. The next line below will establish
            // such a dependency.
            const run_cmd = b.addRunArtifact(exe);

            // By making the run step depend on the install step, it will be run from the
            // installation directory rather than directly from within the cache directory.
            // This is not necessary, however, if the application depends on other installed
            // files, this ensures they will be present and in the expected location.
            run_cmd.step.dependOn(b.getInstallStep());

            // This allows the user to pass arguments to the application in the build
            // command itself, like this: `zig build run -- arg1 arg2 etc`
            if (b.args) |args| {
                run_cmd.addArgs(args);
            }

            // This creates a build step. It will be visible in the `zig build --help` menu,
            // and can be selected like this: `zig build run`
            // This will evaluate the `run` step rather than the default, which is "install".
            const run_step = b.step(b.fmt("run-{s}", .{day_name}), "Run the app");
            run_step.dependOn(&run_cmd.step);

            const exe_unit_tests = b.addTest(.{
                .root_source_file = b.path("src/main.zig"),
                .target = target,
                .optimize = optimize,
            });

            const run_exe_unit_tests = b.addRunArtifact(exe_unit_tests);

            // Similar to creating the run step earlier, this exposes a `test` step to
            // the `zig build --help` menu, providing a way for the user to request
            // running the unit tests.
            const test_step = b.step(b.fmt("test-{s}", .{day_name}), "Run unit tests");
            test_step.dependOn(&run_exe_unit_tests.step);
        }
    }
}
