mf.include("chat_commands.js");
mf.include("assert.js");
mf.include("arrays.js");

/**
 * Example:
 * var id;
 * var count = 0;
 * task_manager.doLater(new task_manager.Task(function start() {
 *     id = mf.setIntevral(function() {
 *         mf.debug("hello");
 *         if (++count === 10) {
 *             task_manager.done();
 *         }
 *     }, 1000);
 * }, function stop() {
 *     mf.clearInterval(id);
 * }, "saying hello 10 times");
 */
task_manager = {};

(function() {
    /**
     * Constructor.
     * @param start_func() called when the job starts or resumes
     * @param stop_func() called when the job should pause or abort
     * @param string either a toString function or a string used to display the task in a list
     */
    task_manager.Task = function(start_func, stop_func, string, resume_func) {
        assert.isFunction(start_func);
        this.start = start_func;
        assert.isFunction(stop_func);
        this.stop = stop_func;
        if (typeof string === "string") {
            var old_string = string;
            string = function() { return old_string; };
        }
        assert.isFunction(string);
        this.toString = string;
        if (resume_func !== undefined) {
            assert.isFunction(resume_func);
            this.resume = resume_func;
        }
        this.started = false;
    };
    tasks = [];

    function runNextCommand() {
        if (tasks.length === 0) {
            return;
        }
        if (tasks[0].started && tasks[0].resume !== undefined) {
            tasks[0].resume();
        } else {
            tasks[0].start();
            tasks[0].started = true;
        }
    };

    task_manager.doLater = function(task) {
        tasks.push(task);
        if (tasks.length === 1) {
            runNextCommand();
        }
    };
    task_manager.doNow = function(task) {
        if (tasks.length !== 0) {
            tasks[0].stop();
        }
        tasks.remove(task);
        tasks.unshift(task);
        runNextCommand();
    };

    task_manager.done = function() {
        assert.isTrue(tasks.length !== 0);
        tasks.shift();
        runNextCommand();
    };

    task_manager.postpone = function() {
        tasks.remove(task);
        tasks.push(task);
        runNextCommand();
    };


    chat_commands.registerCommand("stop", function() {
        if (tasks.length === 0) {
            return;
        }
        tasks[0].stop();
        tasks = [];
    });
    chat_commands.registerCommand("tasks",function(speaker,args,responder_fun) {
        responder_fun("Tasks: " + tasks.join(", "));
    });
    chat_commands.registerCommand("reboot", function(speaker, args, responder_fun) {
        if (tasks.length === 0) {
            responder_fun("no tasks");
            return;
        }
        tasks[0].stop();
        tasks[0].start();
    }),
})();