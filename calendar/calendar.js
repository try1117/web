'use strict';

(function() {
    // weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    const weekdays = ['Mo','Tu','We','Th','Fr','Sa','Su']
    const monthName = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const cellClasses = new Map([['selected', 'calendar-selected-cell'], ['today', 'calendar-today-cell']]);

    let calendarCounter = 0;

    class Calendar {
        constructor(container) {
            this.calendarCounter = calendarCounter++;
            this.container = container;

            this.generateInput();
            this.dropdownContainer = document.createElement('div');
            this.dropdownContainer.classList.add('calendar-dropdown-container');
            this.container.appendChild(this.dropdownContainer);

            this.generateTopBar();
            this.generateTable();

            this.date = new Date();
            this.selectedDate = new Date();
            this.repaintCalendar();
            this.addExistingSelection();
        }

        generateTable() {
            this.table = document.createElement('table');
            this.dropdownContainer.appendChild(this.table);

            let headers = this.table.appendChild(document.createElement('tr'));
            for (let col = 0; col < 7; ++col) {
                let header = document.createElement('th');
                header.appendChild(document.createTextNode(weekdays[col]));
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
                            self.removeExistingSelection();
                            self.selectedDate.setYear(self.date.getFullYear());
                            self.selectedDate.setMonth(self.date.getMonth());
                            self.selectedDate.setDate(this.innerHTML);
                            self.addExistingSelection();
                            self.dateInput.value = self.dateToString(self.selectedDate);
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
                self.removeExistingSelection();
                self.date.setMonth(self.date.getMonth() - 1);
                self.repaintCalendar();
                self.addExistingSelection();
            });
            nextBtn.addEventListener('click', function() {
                self.removeExistingSelection();
                self.date.setMonth(self.date.getMonth() + 1);
                self.repaintCalendar();
                self.addExistingSelection();
            });

            monthYearCaption.innerHTML = 'month-year';
            prevBtn.innerHTML = '&#10094;';
            nextBtn.innerHTML = '&#10095;';

            dateContainer.appendChild(prevBtn);
            dateContainer.appendChild(monthYearCaption);
            dateContainer.appendChild(nextBtn);

            dateContainer.classList.add('calendar-month-year-container');
            this.monthYearCaption = monthYearCaption;
            this.dropdownContainer.appendChild(dateContainer);
        }

        generateInput() {
            let self = this;
            let dateInputContainer = document.createElement('div');
            dateInputContainer.classList.add('calendar-input-container');
            this.container.appendChild(dateInputContainer);

            this.dateInput = document.createElement('input');
            dateInputContainer.appendChild(this.dateInput);
            this.dateInput.setAttribute('maxlength', 10);

            let dropdownBtn = document.createElement('button');
            dateInputContainer.appendChild(dropdownBtn);
            dropdownBtn.classList.add('calendar-dropdown-btn');

            let dropdownHidden = true;
            dropdownBtn.addEventListener('click', function() {
                let checkForOutsideClick = function(event) {
                    if (!self.container.contains(event.target)) {
                        self.dropdownContainer.classList.remove('calendar-dropdown-container-show');
                        dropdownHidden = true;
                        document.removeEventListener('click', checkForOutsideClick);
                    }
                };

                if (dropdownHidden) {
                    self.dropdownContainer.classList.add('calendar-dropdown-container-show');
                    document.addEventListener('click', checkForOutsideClick);
                }
                else {
                    self.dropdownContainer.classList.remove('calendar-dropdown-container-show');
                    document.removeEventListener('click', checkForOutsideClick);
                }
                dropdownHidden = !dropdownHidden;
            });

            this.dateInput.addEventListener('change', function() {
                let parts = this.value.split('.');
                let date = new Date(parts[2], parts[1] - 1, parts[0]);
                if (!isNaN(date.getTime())) {
                    self.removeExistingSelection();
                    self.selectedDate = date;
                    self.date = date;
                    self.repaintCalendar();
                    self.addExistingSelection();
                }
            });
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

            this.monthYearCaption.innerHTML = monthName[this.date.getMonth()] + ' ' + this.date.getFullYear();
            this.dateInput.value = this.dateToString(this.selectedDate);
            this.table.lastChild.style.display = (enableSixRow ? 'table-row' : 'none');
        }

        getCellId(row, col) {
            return 'calendar_' + this.calendarCounter + '_cell_' + (7 * row + col);
        }

        applyPropertyToCell(cellDate, applyFunction, cellClass)
        {
            let cell = this.getCellByDate(cellDate);
            if (cell) {
                cell.classList[applyFunction](cellClasses.get(cellClass));
            }
        }

        removeExistingSelection() {
            this.applyPropertyToCell(this.selectedDate, 'remove', 'selected');
            this.applyPropertyToCell(new Date(), 'remove', 'today');
        }

        addExistingSelection() {
            this.applyPropertyToCell(this.selectedDate, 'add', 'selected');
            this.applyPropertyToCell(new Date(), 'add', 'today');
        }

        getCellByDate(date) {
            if (this.date.getMonth() == date.getMonth() &&
                this.date.getFullYear() == date.getFullYear())
            {
                for (let row = 0; row < 6; ++row) {
                    for (let col = 0; col < 7; ++col) {
                        let cell = document.getElementById(this.getCellId(row, col));
                        if (cell.innerHTML == date.getDate()) {
                            return cell;
                        }
                    }
                }
            }

            return null;
        }

        dateToString(date) {
            return date.toLocaleDateString('ru');
        }
    }

    window.onload = function() {
        let calendarContainers = document.getElementsByClassName('calendar-input');
        for (let container of calendarContainers) {
            new Calendar(container);
        }
    }
})();
