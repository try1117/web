'use strict';

var calendarCounter = 0;

class Calendar {
    constructor(container) {
        // this.weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        this.weekdays=['Mo','Tu','We','Th','Fr','Sa','Su']
        this.monthName=['January','February','March','April','May','June','July','August','September','October','November','December'];

        this.calendarCounter = calendarCounter++;
        this.container = container;
        this.generateInput();
        this.generateTopBar();
        this.generateTable();

        this.date = new Date();
        this.selectedDate = new Date();
        this.repaintCalendar();
        this.selectInitialDate();
    }

    generateTable() {
        this.table = document.createElement('table');
        this.container.appendChild(this.table);

        let headers = this.table.appendChild(document.createElement('tr'));
        for (let col = 0; col < 7; ++col) {
            let header = document.createElement('th');
            header.appendChild(document.createTextNode(this.weekdays[col]));
            headers.appendChild(header);
        }

        for (let row = 0; row < 6; ++row) {
            let rowElement = document.createElement('tr');
            this.table.appendChild(rowElement);

            for (let col = 0; col < 7; ++col) {
                let cellElement = document.createElement('td');
                cellElement.id = this.getCellId(row, col);
                rowElement.appendChild(cellElement);

                let self = this;
                cellElement.addEventListener('click', function() {
                    if (this.innerHTML) {
                        self.removePreviousSelection();
                        this.classList.add('calendar-selected-cell');
                        self.lastSelectedCell = this;

                        self.selectedDate.setYear(self.date.getFullYear());
                        self.selectedDate.setMonth(self.date.getMonth());
                        self.selectedDate.setDate(this.innerHTML);

                        // TODO: event on date change
                        self.dateInput.value = self.selectedDate.toDateString();
                    }
                });
            }
        }
    }

    generateTopBar() {
        let dateContainer = document.createElement('div');
        let monthYearCaption = document.createElement('div');
        let prevBtn = document.createElement('button');
        let nextBtn = document.createElement('button');
        var self = this;

        prevBtn.addEventListener('click', function() {
            self.date.setMonth(self.date.getMonth() - 1);
            self.removePreviousSelection();
            self.addPreviousSelection();
            self.repaintCalendar();
        });
        nextBtn.addEventListener('click', function() {
            self.date.setMonth(self.date.getMonth() + 1);
            self.removePreviousSelection();
            self.addPreviousSelection();
            self.repaintCalendar();
        });

        monthYearCaption.innerHTML = 'month-year';
        prevBtn.innerHTML = '&#10094;';
        nextBtn.innerHTML = '&#10095;';

        dateContainer.appendChild(prevBtn);
        dateContainer.appendChild(monthYearCaption);
        dateContainer.appendChild(nextBtn);

        dateContainer.classList.add('calendar-month-year-container');
        this.container.appendChild(dateContainer);
        this.monthYearCaption = monthYearCaption;
    }

    generateInput() {
        this.dateInput = document.createElement('input');
        this.container.appendChild(this.dateInput);
        // dateInput.type = 'date';
        // dateInput.value = '28-Oct-2018';
    }

    repaintCalendar() {
        let firstDay = new Date(this.date);
        firstDay.setDate(1);

        // 0 is Sunday while in our model 0 is Monday, -1 = +6 (mod 7)
        // another plus one to make it 1-based
        let weekday = 1 + (firstDay.getDay() + 6) % 7;
        let daysInMonth = new Date(this.date.getYear(), this.date.getMonth() + 1, 0).getDate();

        let tableIdx = 0;
        let enableSixRow = false;
        for (let row = 0; row < 6; ++row) {
            for (let col = 0; col < 7; ++col) {
                ++tableIdx;
                let curDay = tableIdx - weekday + 1;
                if (1 <= curDay && curDay <= daysInMonth) {
                    if (row == 5) enableSixRow = true;
                    document.getElementById(this.getCellId(row, col)).innerHTML = curDay;
                }
                else {
                    document.getElementById(this.getCellId(row, col)).innerHTML = '';
                }
            }
        }

        this.monthYearCaption.innerHTML = this.monthName[this.date.getMonth()] + ' ' + this.date.getFullYear();
        this.dateInput.value = this.selectedDate.toDateString();
        this.table.lastChild.style.display = (enableSixRow ? 'table-row' : 'none');
    }

    getCellId(row, col) {
        return 'calendar_' + this.calendarCounter + '_cell_' + (7 * row + col);
    }

    removePreviousSelection() {
        if (this.lastSelectedCell) {
            this.lastSelectedCell.classList.remove('calendar-selected-cell');
        }
    }

    addPreviousSelection() {
        if (!this.lastSelectedCell) return;

        if (this.selectedDate.getFullYear() == this.date.getFullYear() &&
            this.selectedDate.getMonth() == this.date.getMonth())
        {
            this.lastSelectedCell.classList.add('calendar-selected-cell');
        }
        else {
            this.lastSelectedCell.classList.remove('calendar-selected-cell');
        }
    }

    selectInitialDate() {
        for (let row = 0; row < 6; ++row) {
            for (let col = 0; col < 7; ++col) {
                let cell = document.getElementById(this.getCellId(row, col));
                if (cell.innerHTML == this.date.getDate()) {
                    cell.classList.add('calendar-selected-cell');
                    this.lastSelectedCell = cell;
                }
            }
        }
    }
}

window.onload = function() {
    let calendarContainers = document.getElementsByClassName('calendar');
    for (let container of calendarContainers) {
        new Calendar(container);
    }
}
