const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

const formatDateTime = 'DD-MM-YYYY HH:mm:ss';

var app = new Vue({
    el: '#app',
    data: {
        // Form
        showForm: false,
        type: 'programing',
        description: '',
        // Data
        timers: [],
        currentTimer: '00:00:00',
        totalTime: '00:00:00',
        start: true,
        stop: false,
        startTime: '',
        endTime: '',
        startTimeStr: '',
        intervalTimer: '',
        // Site
        currentYear: new Date().getFullYear(),
    },
    mounted: function () {
        var vm = this;

        if (localStorage.timers) {
            this.timers = JSON.parse(localStorage.getItem('timers'));
            this.sumTimeMethod()
        }

        if (localStorage.startTimeStr) {
            this.showForm = true;
            this.start = false;
            this.stop = true;
            this.startTimeStr = localStorage.getItem('startTimeStr');
            this.startTime = moment(this.startTimeStr, formatDateTime)
        }

        if (this.startTimeStr != '') {
            vm.timerMethod();
        }
    },
    methods: {
        formatTimeMethod(hh, mm, ss) {
            if (hh < 10) {
                hh = '0' + hh
            }

            if (mm < 10) {
                mm = '0' + mm
            }

            if (ss < 10) {
                ss = '0' + ss
            }

            return hh + ':' + mm + ':' + ss;
        },
        timerMethod() {
            this.intervalTimer = setInterval(() => {
                this.endTimeMoment();
                this.currentTimer = this.getDuration(this.endTime, this.startTime);
            }, 1000);
        },
        startTimeMoment() {
            this.startTime = new moment();
            setTimeout(() => {
                this.startTimeStr = this.startTime.format(formatDateTime);
                localStorage.startTimeStr = this.startTime.format(formatDateTime);
            }, 500);
            this.showForm = true;
        },
        endTimeMoment() {
            this.endTime = new moment();
        },
        getDuration(endTime, startTime) {
            let duration = moment.duration(endTime.diff(startTime));
            let hh = duration.hours();
            let mm = duration.minutes();
            let ss = duration.seconds();

            return this.formatTimeMethod(hh, mm, ss);
        },
        generateHashMethod() {
            return '_' + Math.random().toString(36).substr(2, 9);
        },
        setItemTimerMethod(startTime, endTime) {
            let hash = this.generateHashMethod();
            this.timers.push({
                'hash': hash,
                'name': this.getNameType(this.type),
                'description': this.description,
                'start': startTime,
                'end': endTime,
                'time': this.currentTimer
            });
            localStorage.timers = JSON.stringify(this.timers);
            this.sumTimeMethod();
            this.type = 'programing';
            this.description = '';
        },
        searchTimers() {
            this.timers.forEach(element => {
                console.log("__>", element.hash);
            });
        },
        sumTimeMethod(data) {
            let durations = [];
            this.timers.forEach(element => {
                durations.push(element.time);
            });

            let totalDurations = durations.slice(1)
                .reduce((prev, cur) => moment.duration(cur).add(prev),
                    moment.duration(durations[0]));

            let ms = totalDurations._milliseconds;
            let ticks = ms / 1000;
            let hh = Math.floor(ticks / 3600);
            let mm = Math.floor((ticks % 3600) / 60);
            let ss = ticks % 60;

            this.totalTime = this.formatTimeMethod(hh, mm, ss);;
        },
        startMethod() {
            this.start = false;
            this.stop = true;
            this.startTimeMoment();
            this.timerMethod();
        },
        stopMethod() {
            this.showForm = false;
            this.start = true;
            this.stop = false;
            this.stopIntervalTimerMethod();
            let endTimeStr = this.endTime.format(formatDateTime);
            this.setItemTimerMethod(this.startTimeStr, endTimeStr);
            localStorage.startTimeStr = '';
            this.startTimeStr = '';
            this.resetForm();
            Toast.fire({
                icon: 'success',
                title: 'Data saved successfully'
            })
        },
        deleteMethod() {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
            }).then((result) => {
                if (result.value) {
                    this.timers = [];
                    this.startTime = '';
                    this.endTime = '';
                    this.totalTime = '00:00:00';
                    this.startTimeStr = '';
                    this.endDateTime = '';
                    this.startDateTime = '';
                    this.intervalTimer = '';
                    localStorage.clear();
                    this.stopIntervalTimerMethod();
                    this.resetForm();
                    Swal.fire(
                        'Deleted!',
                        'The data has been deleted.',
                        'success'
                    )
                }
            })
        },
        exportMethod(){
            Toast.fire({
                icon: 'warning',
                title: 'Action not allowed'
            })
        },
        stopIntervalTimerMethod() {
            clearInterval(this.intervalTimer);
        },
        resetForm() {
            this.currentTimer = '00:00:00',
                this.start = true;
            this.stop = false;
            this.delete = false;
        },
        getNameType(type) {
            let str = '';
            if (type != '' && type != null) {
                switch (type) {
                    case 'research':
                        str = 'Research';
                        break;
                    case 'programing':
                        str = 'Programming'
                        break;
                    case 'meeting':
                        str = 'Meeting';
                        break;
                    case 'relax':
                        str = 'Break';
                        break;
                    default:
                        str = 'Unknown';
                        break;
                }
            }
            return str;
        }
    }
});