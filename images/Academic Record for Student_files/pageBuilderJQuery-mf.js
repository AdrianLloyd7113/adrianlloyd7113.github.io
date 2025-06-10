var process = process || {env: {NODE_ENV: "development"}};
﻿/* http://keith-wood.name/calendars.html
   Calendars for jQuery v1.1.4.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* Calendars - generic date access and manipulation. */
function Calendars() {
	this.regional = {
		'': {invalidCalendar: 'Calendar {0} not found',
			invalidDate: 'Invalid {0} date',
			invalidMonth: 'Invalid {0} month',
			invalidYear: 'Invalid {0} year',
			differentCalendars: 'Cannot mix {0} and {1} dates'}
	};
	this.local = this.regional[''];
	this.calendars = {};
	this._localCals = {};
}

$.extend(Calendars.prototype, {

	/* Obtain a calendar implementation and localisation.
	   @param  name      (string) the name of the calendar,
	                     e.g. 'gregorian' (default), 'persian', 'islamic' (optional)
	   @param  language  (string) the language code to use for localisation
	                     (optional, default English = 'en')
	   @return  the calendar and localisation
	   @throws  error if calendar not found */
	instance: function(name, language) {
		name = (name || 'gregorian').toLowerCase();
		language = language || '';
		var cal = this._localCals[name + '-' + language];
		if (!cal && this.calendars[name]) {
			cal = new this.calendars[name](language);
			this._localCals[name + '-' + language] = cal;
		}
		if (!cal) {
			throw (this.local.invalidCalendar || this.regional[''].invalidCalendar).
				replace(/\{0\}/, name);
		}
		return cal;
	},

	/* Create a new date - for today if no other parameters given.
	   @param  year      (CDate) the date to copy or
	                     (number) the year for the date
	   @param  month     (number, optional) the month for the date
	   @param  day       (number, optional) the day for the date
	   @param  calendar  (*Calendar) the underlying calendar
	                     or (string) the name of the calendar (optional, default Gregorian)
	   @param  language  (string) the language to use for localisation (optional, default English)
	   @return  (CDate) the new date
	   @throws  error if an invalid date */
	newDate: function(year, month, day, calendar, language) {
		calendar = (year != null && year.year ? year.calendar() : (typeof calendar == 'string' ?
			this.instance(calendar, language) : calendar)) || this.instance();
		return calendar.newDate(year, month, day);
	}
});

/* Generic date, based on a particular calendar.
   @param  calendar  (*Calendar) the underlying calendar implementation
   @param  year      (number) the year for this date
   @param  month     (number) the month for this date
   @param  day       (number) the day for this date
   @return  (CDate) the date object
   @throws  error if an invalid date */
function CDate(calendar, year, month, day) {
	this._calendar = calendar;
	this._year = year;
	this._month = month;
	this._day = day;
	if (this._calendar._validateLevel == 0 &&
			!this._calendar.isValid(this._year, this._month, this._day)) {
		throw ($.calendars.local.invalidDate || $.calendars.regional[''].invalidDate).
			replace(/\{0\}/, this._calendar.local.name);
	}
}

/* Pad a numeric value with leading zeroes.
   @param  value   (number) the number to format
   @param  length  (number) the minimum length
   @return  (string) the formatted number */
function pad(value, length) {
	value = '' + value;
	return '000000'.substring(0, length - value.length) + value;
}

$.extend(CDate.prototype, {

	/* Create a new date.
	   @param  year   (CDate) the date to copy or
	                  (number) the year for the date (optional, default this date)
	   @param  month  (number) the month for the date (optional)
	   @param  day    (number) the day for the date (optional)
	   @return  (CDate) the new date
	   @throws  error if an invalid date */
	newDate: function(year, month, day) {
		return this._calendar.newDate((year == null ? this : year), month, day);
	},

	/* Set or retrieve the year for this date.
	   @param  year  (number) the year for the date (optional)
	   @return  (number) the date's year (if no parameter) or
	            (CDate) the updated date
	   @throws  error if an invalid date */
	year: function(year) {
		return (arguments.length == 0 ? this._year : this.set(year, 'y'));
	},

	/* Set or retrieve the month for this date.
	   @param  month  (number) the month for the date (optional)
	   @return  (number) the date's month (if no parameter) or
	            (CDate) the updated date
	   @throws  error if an invalid date */
	month: function(month) {
		return (arguments.length == 0 ? this._month : this.set(month, 'm'));
	},

	/* Set or retrieve the day for this date.
	   @param  day  (number) the day for the date (optional)
	   @return  (number) the date's day (if no parameter) or
	            (CDate) the updated date
	   @throws  error if an invalid date */
	day: function(day) {
		return (arguments.length == 0 ? this._day : this.set(day, 'd'));
	},

	/* Set new values for this date.
	   @param  year   (number) the year for the date
	   @param  month  (number) the month for the date
	   @param  day    (number) the day for the date
	   @return  (CDate) the updated date
	   @throws  error if an invalid date */
	date: function(year, month, day) {
		if (!this._calendar.isValid(year, month, day)) {
			throw ($.calendars.local.invalidDate || $.calendars.regional[''].invalidDate).
				replace(/\{0\}/, this._calendar.local.name);
		}
		this._year = year;
		this._month = month;
		this._day = day;
		return this;
	},

	/* Determine whether this date is in a leap year.
	   @return  (boolean) true if this is a leap year, false if not */
	leapYear: function() {
		return this._calendar.leapYear(this);
	},

	/* Retrieve the epoch designator for this date, e.g. BCE or CE.
	   @return  (string) the current epoch */
	epoch: function() {
		return this._calendar.epoch(this);
	},

	/* Format the year, if not a simple sequential number.
	   @return  (string) the formatted year */
	formatYear: function() {
		return this._calendar.formatYear(this);
	},

	/* Retrieve the month of the year for this date,
	   i.e. the month's position within a numbered year.
	   @return  (number) the month of the year: minMonth to months per year */
	monthOfYear: function() {
		return this._calendar.monthOfYear(this);
	},

	/* Retrieve the week of the year for this date.
	   @return  (number) the week of the year: 1 to weeks per year */
	weekOfYear: function() {
		return this._calendar.weekOfYear(this);
	},

	/* Retrieve the number of days in the year for this date.
	   @return  (number) the number of days in this year */
	daysInYear: function() {
		return this._calendar.daysInYear(this);
	},

	/* Retrieve the day of the year for this date.
	   @return  (number) the day of the year: 1 to days per year */
	dayOfYear: function() {
		return this._calendar.dayOfYear(this);
	},

	/* Retrieve the number of days in the month for this date.
	   @return  (number) the number of days */
	daysInMonth: function() {
		return this._calendar.daysInMonth(this);
	},

	/* Retrieve the day of the week for this date.
	   @return  (number) the day of the week: 0 to number of days - 1 */
	dayOfWeek: function() {
		return this._calendar.dayOfWeek(this);
	},

	/* Determine whether this date is a week day.
	   @return  (boolean) true if a week day, false if not */
	weekDay: function() {
		return this._calendar.weekDay(this);
	},

	/* Retrieve additional information about this date.
	   @return  (object) additional information - contents depends on calendar */
	extraInfo: function() {
		return this._calendar.extraInfo(this);
	},

	/* Add period(s) to a date.
	   @param  offset  (number) the number of periods to adjust by
	   @param  period  (string) one of 'y' for year, 'm' for month, 'w' for week, 'd' for day
	   @return  (CDate) the updated date */
	add: function(offset, period) {
		return this._calendar.add(this, offset, period);
	},

	/* Set a portion of the date.
	   @param  value   (number) the new value for the period
	   @param  period  (string) one of 'y' for year, 'm' for month, 'd' for day
	   @return  (CDate) the updated date
	   @throws  error if not a valid date */
	set: function(value, period) {
		return this._calendar.set(this, value, period);
	},

	/* Compare this date to another date.
	   @param  date  (CDate) the other date
	   @return  (number) -1 if this date is before the other date,
	            0 if they are equal, or +1 if this date is after the other date */
	compareTo: function(date) {
		if (this._calendar.name != date._calendar.name) {
			throw ($.calendars.local.differentCalendars || $.calendars.regional[''].differentCalendars).
				replace(/\{0\}/, this._calendar.local.name).replace(/\{1\}/, date._calendar.local.name);
		}
		var c = (this._year != date._year ? this._year - date._year :
			this._month != date._month ? this.monthOfYear() - date.monthOfYear() :
			this._day - date._day);
		return (c == 0 ? 0 : (c < 0 ? -1 : +1));
	},

	/* Retrieve the calendar backing this date.
	   @return  (*Calendar) the calendar implementation */
	calendar: function() {
		return this._calendar;
	},

	/* Retrieve the Julian date equivalent for this date,
	   i.e. days since January 1, 4713 BCE Greenwich noon.
	   @return  (number) the equivalent Julian date */
	toJD: function() {
		return this._calendar.toJD(this);
	},

	/* Create a new date from a Julian date.
	   @param  jd  (number) the Julian date to convert
	   @return  (CDate) the equivalent date */
	fromJD: function(jd) {
		return this._calendar.fromJD(jd);
	},

	/* Convert this date to a standard (Gregorian) JavaScript Date.
	   @return  (Date) the equivalent JavaScript date */
	toJSDate: function() {
		return this._calendar.toJSDate(this);
	},

	/* Create a new date from a standard (Gregorian) JavaScript Date.
	   @param  jsd  (Date) the JavaScript date to convert
	   @return  (CDate) the equivalent date */
	fromJSDate: function(jsd) {
		return this._calendar.fromJSDate(jsd);
	},

	/* Convert to a string for display.
	   @return  (string) this date as a string */
	toString: function() {
		return (this.year() < 0 ? '-' : '') + pad(Math.abs(this.year()), 4) +
			'-' + pad(this.month(), 2) + '-' + pad(this.day(), 2);
	}
});

/* Basic functionality for all calendars.
   Other calendars should extend this:
   OtherCalendar.prototype = new BaseCalendar; */
function BaseCalendar() {
	this.shortYearCutoff = '+10';
}

$.extend(BaseCalendar.prototype, {
	_validateLevel: 0, // "Stack" to turn validation on/off

	/* Create a new date within this calendar - today if no parameters given.
	   @param  year   (CDate) the date to duplicate or
	                  (number) the year for the date
	   @param  month  (number) the month for the date
	   @param  day    (number) the day for the date
	   @return  (CDate) the new date
	   @throws  error if not a valid date or a different calendar used */
	newDate: function(year, month, day) {
		if (year == null) {
			return this.today();
		}
		if (year.year) {
			this._validate(year, month, day,
				$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
			day = year.day();
			month = year.month();
			year = year.year();
		}
		return new CDate(this, year, month, day);
	},

	/* Create a new date for today.
	   @return  (CDate) today's date */
	today: function() {
		return this.fromJSDate(new Date());
	},

	/* Retrieve the epoch designator for this date.
	   @param  year  (CDate) the date to examine or
	                 (number) the year to examine
	   @return  (string) the current epoch
	   @throws  error if an invalid year or a different calendar used */
	epoch: function(year) {
		var date = this._validate(year, this.minMonth, this.minDay,
			$.calendars.local.invalidYear || $.calendars.regional[''].invalidYear);
		return (date.year() < 0 ? this.local.epochs[0] : this.local.epochs[1]);
	},

	/* Format the year, if not a simple sequential number
	   @param  year  (CDate) the date to format or
	                 (number) the year to format
	   @return  (string) the formatted year
	   @throws  error if an invalid year or a different calendar used */
	formatYear: function(year) {
		var date = this._validate(year, this.minMonth, this.minDay,
			$.calendars.local.invalidYear || $.calendars.regional[''].invalidYear);
		return (date.year() < 0 ? '-' : '') + pad(Math.abs(date.year()), 4)
	},

	/* Retrieve the number of months in a year.
	   @param  year  (CDate) the date to examine or
	                 (number) the year to examine
	   @return  (number) the number of months
	   @throws  error if an invalid year or a different calendar used */
	monthsInYear: function(year) {
		this._validate(year, this.minMonth, this.minDay,
			$.calendars.local.invalidYear || $.calendars.regional[''].invalidYear);
		return 12;
	},

	/* Calculate the month's ordinal position within the year -
	   for those calendars that don't start at month 1!
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @return  (number) the ordinal position, starting from minMonth
	   @throws  error if an invalid year/month or a different calendar used */
	monthOfYear: function(year, month) {
		var date = this._validate(year, month, this.minDay,
			$.calendars.local.invalidMonth || $.calendars.regional[''].invalidMonth);
		return (date.month() + this.monthsInYear(date) - this.firstMonth) %
			this.monthsInYear(date) + this.minMonth;
	},

	/* Calculate actual month from ordinal position, starting from minMonth.
	   @param  year  (number) the year to examine
	   @param  ord   (number) the month's ordinal position
	   @return  (number) the month's number
	   @throws  error if an invalid year/month */
	fromMonthOfYear: function(year, ord) {
		var m = (ord + this.firstMonth - 2 * this.minMonth) %
			this.monthsInYear(year) + this.minMonth;
		this._validate(year, m, this.minDay,
			$.calendars.local.invalidMonth || $.calendars.regional[''].invalidMonth);
		return m;
	},

	/* Retrieve the number of days in a year.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @return  (number) the number of days
	   @throws  error if an invalid year or a different calendar used */
	daysInYear: function(year) {
		var date = this._validate(year, this.minMonth, this.minDay,
			$.calendars.local.invalidYear || $.calendars.regional[''].invalidYear);
		return (this.leapYear(date) ? 366 : 365);
	},

	/* Retrieve the day of the year for a date.
	   @param  year   (CDate) the date to convert or
	                  (number) the year to convert
	   @param  month  (number) the month to convert
	   @param  day    (number) the day to convert
	   @return  (number) the day of the year
	   @throws  error if an invalid date or a different calendar used */
	dayOfYear: function(year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		return date.toJD() - this.newDate(date.year(),
			this.fromMonthOfYear(date.year(), this.minMonth), this.minDay).toJD() + 1;
	},

	/* Retrieve the number of days in a week.
	   @return  (number) the number of days */
	daysInWeek: function() {
		return 7;
	},

	/* Retrieve the day of the week for a date.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (number) the day of the week: 0 to number of days - 1
	   @throws  error if an invalid date or a different calendar used */
	dayOfWeek: function(year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		return (Math.floor(this.toJD(date)) + 2) % this.daysInWeek();
	},

	/* Retrieve additional information about a date.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (object) additional information - contents depends on calendar
	   @throws  error if an invalid date or a different calendar used */
	extraInfo: function(year, month, day) {
		this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		return {};
	},

	/* Add period(s) to a date.
	   Cater for no year zero.
	   @param  date    (CDate) the starting date
	   @param  offset  (number) the number of periods to adjust by
	   @param  period  (string) one of 'y' for year, 'm' for month, 'w' for week, 'd' for day
	   @return  (CDate) the updated date
	   @throws  error if a different calendar used */
	add: function(date, offset, period) {
		this._validate(date, this.minMonth, this.minDay,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		return this._correctAdd(date, this._add(date, offset, period), offset, period);
	},

	/* Add period(s) to a date.
	   @param  date    (CDate) the starting date
	   @param  offset  (number) the number of periods to adjust by
	   @param  period  (string) one of 'y' for year, 'm' for month, 'w' for week, 'd' for day
	   @return  (CDate) the updated date */
	_add: function(date, offset, period) {
		this._validateLevel++;
		if (period == 'd' || period == 'w') {
			var jd = date.toJD() + offset * (period == 'w' ? this.daysInWeek() : 1);
			var d = date.calendar().fromJD(jd);
			this._validateLevel--;
			return [d.year(), d.month(), d.day()];
		}
		try {
			var y = date.year() + (period == 'y' ? offset : 0);
			var m = date.monthOfYear() + (period == 'm' ? offset : 0);
			var d = date.day();// + (period == 'd' ? offset : 0) +
				//(period == 'w' ? offset * this.daysInWeek() : 0);
			var resyncYearMonth = function(calendar) {
				while (m < calendar.minMonth) {
					y--;
					m += calendar.monthsInYear(y);
					}
				var yearMonths = calendar.monthsInYear(y);
				while (m > yearMonths - 1 + calendar.minMonth) {
					y++;
					m -= yearMonths;
					yearMonths = calendar.monthsInYear(y);
				}
			};
			if (period == 'y') {
				if (date.month() != this.fromMonthOfYear(y, m)) { // Hebrew
					m = this.newDate(y, date.month(), this.minDay).monthOfYear();
				}
				m = Math.min(m, this.monthsInYear(y));
				d = Math.min(d, this.daysInMonth(y, this.fromMonthOfYear(y, m)));
			}
			else if (period == 'm') {
				resyncYearMonth(this);
				d = Math.min(d, this.daysInMonth(y, this.fromMonthOfYear(y, m)));
			}
			var ymd = [y, this.fromMonthOfYear(y, m), d];
			this._validateLevel--;
			return ymd;
		}
		catch (e) {
			this._validateLevel--;
			throw e;
		}
	},

	/* Correct a candidate date after adding period(s) to a date.
	   Handle no year zero if necessary.
	   @param  date    (CDate) the starting date
	   @param  ymd     (number[3]) the added date
	   @param  offset  (number) the number of periods to adjust by
	   @param  period  (string) one of 'y' for year, 'm' for month, 'w' for week, 'd' for day
	   @return  (CDate) the updated date */
	_correctAdd: function(date, ymd, offset, period) {
		if (!this.hasYearZero && (period == 'y' || period == 'm')) {
			if (ymd[0] == 0 || // In year zero
					(date.year() > 0) != (ymd[0] > 0)) { // Crossed year zero
				var adj = {y: [1, 1, 'y'], m: [1, this.monthsInYear(-1), 'm'],
					w: [this.daysInWeek(), this.daysInYear(-1), 'd'],
					d: [1, this.daysInYear(-1), 'd']}[period];
				var dir = (offset < 0 ? -1 : +1);
				ymd = this._add(date, offset * adj[0] + dir * adj[1], adj[2]);
			}
		}
		return date.date(ymd[0], ymd[1], ymd[2]);
	},

	/* Set a portion of the date.
	   @param  date    (CDate) the starting date
	   @param  value   (number) the new value for the period
	   @param  period  (string) one of 'y' for year, 'm' for month, 'd' for day
	   @return  (CDate) the updated date
	   @throws  error if an invalid date or a different calendar used */
	set: function(date, value, period) {
		this._validate(date, this.minMonth, this.minDay,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		var y = (period == 'y' ? value : date.year());
		var m = (period == 'm' ? value : date.month());
		var d = (period == 'd' ? value : date.day());
		if (period == 'y' || period == 'm') {
			d = Math.min(d, this.daysInMonth(y, m));
		}
		return date.date(y, m, d);
	},

	/* Determine whether a date is valid for this calendar.
	   @param  year   (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (boolean) true if a valid date, false if not */
	isValid: function(year, month, day) {
		this._validateLevel++;
		var valid = (this.hasYearZero || year != 0);
		if (valid) {
			var date = this.newDate(year, month, this.minDay);
			valid = (month >= this.minMonth && month - this.minMonth < this.monthsInYear(date)) &&
				(day >= this.minDay && day - this.minDay < this.daysInMonth(date));
		}
		this._validateLevel--;
		return valid;
	},

	/* Convert the date to a standard (Gregorian) JavaScript Date.
	   @param  year   (CDate) the date to convert or
	                  (number) the year to convert
	   @param  month  (number) the month to convert
	   @param  day    (number) the day to convert
	   @return  (Date) the equivalent JavaScript date
	   @throws  error if an invalid date or a different calendar used */
	toJSDate: function(year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		return $.calendars.instance().fromJD(this.toJD(date)).toJSDate();
	},

	/* Convert the date from a standard (Gregorian) JavaScript Date.
	   @param  jsd  (Date) the JavaScript date
	   @return  (CDate) the equivalent DateUtils date */
	fromJSDate: function(jsd) {
		return this.fromJD($.calendars.instance().fromJSDate(jsd).toJD());
	},

	/* Check that a candidate date is from the same calendar and is valid.
	   @param  year   (CDate) the date to validate or
	                  (number) the year to validate
	   @param  month  (number) the month to validate
	   @param  day    (number) the day to validate
	   @param  error  (string) error message if invalid
	   @throws  error if different calendars used or invalid date */
	_validate: function(year, month, day, error) {
		if (year.year) {
			if (this._validateLevel == 0 && this.name != year.calendar().name) {
				throw ($.calendars.local.differentCalendars || $.calendars.regional[''].differentCalendars).
					replace(/\{0\}/, this.local.name).replace(/\{1\}/, year.calendar().local.name);
			}
			return year;
		}
		try {
			this._validateLevel++;
			if (this._validateLevel == 1 && !this.isValid(year, month, day)) {
				throw error.replace(/\{0\}/, this.local.name);
			}
			var date = this.newDate(year, month, day);
			this._validateLevel--;
			return date;
		}
		catch (e) {
			this._validateLevel--;
			throw e;
		}
	}
});

/* Implementation of the Proleptic Gregorian Calendar.
   See http://en.wikipedia.org/wiki/Gregorian_calendar
   and http://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar.
   @param  language  (string) the language code (default English) for localisation (optional) */
function GregorianCalendar(language) {
	this.local = this.regional[language || ''] || this.regional[''];
}

GregorianCalendar.prototype = new BaseCalendar;

$.extend(GregorianCalendar.prototype, {
	name: 'Gregorian', // The calendar name
	jdEpoch: 1721425.5, // Julian date of start of Gregorian epoch: 1 January 0001 CE
	daysPerMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], // Days per month in a common year
	hasYearZero: false, // True if has a year zero, false if not
	minMonth: 1, // The minimum month number
	firstMonth: 1, // The first month in the year
	minDay: 1, // The minimum day number

	regional: { // Localisations
		'': {
			name: 'Gregorian', // The calendar name
			epochs: ['BCE', 'CE'],
			monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'],
			monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
			dateFormat: 'mm/dd/yyyy', // See format options on parseDate
			firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
			isRTL: false // True if right-to-left language, false if left-to-right
		}
	},
	
	/* Determine whether this date is in a leap year.
	   @param  year  (CDate) the date to examine or
	                 (number) the year to examine
	   @return  (boolean) true if this is a leap year, false if not
	   @throws  error if an invalid year or a different calendar used */
	leapYear: function(year) {
		var date = this._validate(year, this.minMonth, this.minDay,
			$.calendars.local.invalidYear || $.calendars.regional[''].invalidYear);
		var year = date.year() + (date.year() < 0 ? 1 : 0); // No year zero
		return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
	},

	/* Determine the week of the year for a date - ISO 8601.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (number) the week of the year
	   @throws  error if an invalid date or a different calendar used */
	weekOfYear: function(year, month, day) {
		// Find Thursday of this week starting on Monday
		var checkDate = this.newDate(year, month, day);
		checkDate.add(4 - (checkDate.dayOfWeek() || 7), 'd');
		return Math.floor((checkDate.dayOfYear() - 1) / 7) + 1;
	},

	/* Retrieve the number of days in a month.
	   @param  year   (CDate) the date to examine or
	                  (number) the year of the month
	   @param  month  (number) the month
	   @return  (number) the number of days in this month
	   @throws  error if an invalid month/year or a different calendar used */
	daysInMonth: function(year, month) {
		var date = this._validate(year, month, this.minDay,
			$.calendars.local.invalidMonth || $.calendars.regional[''].invalidMonth);
		return this.daysPerMonth[date.month() - 1] +
			(date.month() == 2 && this.leapYear(date.year()) ? 1 : 0);
	},

	/* Determine whether this date is a week day.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (boolean) true if a week day, false if not
	   @throws  error if an invalid date or a different calendar used */
	weekDay: function(year, month, day) {
		return (this.dayOfWeek(year, month, day) || 7) < 6;
	},

	/* Retrieve the Julian date equivalent for this date,
	   i.e. days since January 1, 4713 BCE Greenwich noon.
	   @param  year   (CDate) the date to convert or
	                  (number) the year to convert
	   @param  month  (number) the month to convert
	   @param  day    (number) the day to convert
	   @return  (number) the equivalent Julian date
	   @throws  error if an invalid date or a different calendar used */
	toJD: function(year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		year = date.year();
		month = date.month();
		day = date.day();
		if (year < 0) { year++; } // No year zero
		// Jean Meeus algorithm, "Astronomical Algorithms", 1991
		if (month < 3) {
			month += 12;
			year--;
		}
		var a = Math.floor(year / 100);
		var b = 2 - a + Math.floor(a / 4);
		return Math.floor(365.25 * (year + 4716)) +
			Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
	},

	/* Create a new date from a Julian date.
	   @param  jd  (number) the Julian date to convert
	   @return  (CDate) the equivalent date */
	fromJD: function(jd) {
		// Jean Meeus algorithm, "Astronomical Algorithms", 1991
		var z = Math.floor(jd + 0.5);
		var a = Math.floor((z - 1867216.25) / 36524.25);
		a = z + 1 + a - Math.floor(a / 4);
		var b = a + 1524;
		var c = Math.floor((b - 122.1) / 365.25);
		var d = Math.floor(365.25 * c);
		var e = Math.floor((b - d) / 30.6001);
		var day = b - d - Math.floor(e * 30.6001);
		var month = e - (e > 13.5 ? 13 : 1);
		var year = c - (month > 2.5 ? 4716 : 4715);
		if (year <= 0) { year--; } // No year zero
		return this.newDate(year, month, day);
	},

	/* Convert this date to a standard (Gregorian) JavaScript Date.
	   @param  year   (CDate) the date to convert or
	                  (number) the year to convert
	   @param  month  (number) the month to convert
	   @param  day    (number) the day to convert
	   @return  (Date) the equivalent JavaScript date
	   @throws  error if an invalid date or a different calendar used */
	toJSDate: function(year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regional[''].invalidDate);
		var jsd = new Date(date.year(), date.month() - 1, date.day());
		jsd.setHours(0);
		jsd.setMinutes(0);
		jsd.setSeconds(0);
		jsd.setMilliseconds(0);
		// Hours may be non-zero on daylight saving cut-over:
		// > 12 when midnight changeover, but then cannot generate
		// midnight datetime, so jump to 1AM, otherwise reset.
		jsd.setHours(jsd.getHours() > 12 ? jsd.getHours() + 2 : 0);
		return jsd;
	},

	/* Create a new date from a standard (Gregorian) JavaScript Date.
	   @param  jsd  (Date) the JavaScript date to convert
	   @return  (CDate) the equivalent date */
	fromJSDate: function(jsd) {
		return this.newDate(jsd.getFullYear(), jsd.getMonth() + 1, jsd.getDate());
	}
});

// Singleton manager
$.calendars = new Calendars();

// Date template
$.calendars.cdate = CDate;

// Base calendar template
$.calendars.baseCalendar = BaseCalendar;

// Gregorian calendar implementation
$.calendars.calendars.gregorian = GregorianCalendar;

})(jQuery);

var process = process || {env: {NODE_ENV: "development"}};
﻿/* http://keith-wood.name/calendars.html
   Calendars extras for jQuery v1.1.4.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

$.extend($.calendars.regional[''], {
	invalidArguments: 'Invalid arguments',
	invalidFormat: 'Cannot format a date from another calendar',
	missingNumberAt: 'Missing number at position {0}',
	unknownNameAt: 'Unknown name at position {0}',
	unexpectedLiteralAt: 'Unexpected literal at position {0}',
	unexpectedText: 'Additional text found at end'
});
$.calendars.local = $.calendars.regional[''];

$.extend($.calendars.cdate.prototype, {

	/* Format this date.
	   @param  format  (string) the date format to use (see BaseCalendar.formatDate) (optional)
	   @return  (string) the formatted date */
	formatDate: function(format) {
		return this._calendar.formatDate(format || '', this);
	}
});

$.extend($.calendars.baseCalendar.prototype, {

	UNIX_EPOCH: $.calendars.instance().newDate(1970, 1, 1).toJD(),
	SECS_PER_DAY: 24 * 60 * 60,
	TICKS_EPOCH: $.calendars.instance().jdEpoch, // 1 January 0001 CE
	TICKS_PER_DAY: 24 * 60 * 60 * 10000000,

	ATOM: 'yyyy-mm-dd', // RFC 3339/ISO 8601
	COOKIE: 'D, dd M yyyy',
	FULL: 'DD, MM d, yyyy',
	ISO_8601: 'yyyy-mm-dd',
	JULIAN: 'J',
	RFC_822: 'D, d M yy',
	RFC_850: 'DD, dd-M-yy',
	RFC_1036: 'D, d M yy',
	RFC_1123: 'D, d M yyyy',
	RFC_2822: 'D, d M yyyy',
	RSS: 'D, d M yy', // RFC 822
	TICKS: '!',
	TIMESTAMP: '@',
	W3C: 'yyyy-mm-dd', // ISO 8601

	/* Format a date object into a string value.
	   The format can be combinations of the following:
	   d  - day of month (no leading zero)
	   dd - day of month (two digit)
	   o  - day of year (no leading zeros)
	   oo - day of year (three digit)
	   D  - day name short
	   DD - day name long
	   w  - week of year (no leading zero)
	   ww - week of year (two digit)
	   m  - month of year (no leading zero)
	   mm - month of year (two digit)
	   M  - month name short
	   MM - month name long
	   yy - year (two digit)
	   yyyy - year (four digit)
	   YYYY - formatted year
	   J  - Julian date (days since January 1, 4713 BCE Greenwich noon)
	   @  - Unix timestamp (s since 01/01/1970)
	   !  - Windows ticks (100ns since 01/01/0001)
	   '...' - literal text
	   '' - single quote
	   @param  format    (string) the desired format of the date (optional, default calendar format)
	   @param  date      (CDate) the date value to format
	   @param  settings  (object) attributes include:
	                     dayNamesShort    (string[]) abbreviated names of the days from Sunday (optional)
	                     dayNames         (string[]) names of the days from Sunday (optional)
	                     monthNamesShort  (string[]) abbreviated names of the months (optional)
	                     monthNames       (string[]) names of the months (optional)
						 calculateWeek    (function) function that determines week of the year (optional)
	   @return  (string) the date in the above format
	   @throws  errors if the date is from a different calendar */
	formatDate: function(format, date, settings) {
		if (typeof format != 'string') {
			settings = date;
			date = format;
			format = '';
		}
		if (!date) {
			return '';
		}
		if (date.calendar() != this) {
			throw $.calendars.local.invalidFormat || $.calendars.regional[''].invalidFormat;
		}
		format = format || this.local.dateFormat;
		settings = settings || {};
		var dayNamesShort = settings.dayNamesShort || this.local.dayNamesShort;
		var dayNames = settings.dayNames || this.local.dayNames;
		var monthNamesShort = settings.monthNamesShort || this.local.monthNamesShort;
		var monthNames = settings.monthNames || this.local.monthNames;
		var calculateWeek = settings.calculateWeek || this.local.calculateWeek;
		// Check whether a format character is doubled
		var doubled = function(match, step) {
			var matches = 1;
			while (iFormat + matches < format.length && format.charAt(iFormat + matches) == match) {
				matches++;
			}
			iFormat += matches - 1;
			return Math.floor(matches / (step || 1)) > 1;
		};
		// Format a number, with leading zeroes if necessary
		var formatNumber = function(match, value, len, step) {
			var num = '' + value;
			if (doubled(match, step)) {
				while (num.length < len) {
					num = '0' + num;
				}
			}
			return num;
		};
		// Format a name, short or long as requested
		var formatName = function(match, value, shortNames, longNames) {
			return (doubled(match) ? longNames[value] : shortNames[value]);
		};
		var output = '';
		var literal = false;
		for (var iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) == "'" && !doubled("'")) {
					literal = false;
				}
				else {
					output += format.charAt(iFormat);
				}
			}
			else {
				switch (format.charAt(iFormat)) {
					case 'd': output += formatNumber('d', date.day(), 2); break;
					case 'D': output += formatName('D', date.dayOfWeek(),
						dayNamesShort, dayNames); break;
					case 'o': output += formatNumber('o', date.dayOfYear(), 3); break;
					case 'w': output += formatNumber('w', date.weekOfYear(), 2); break;
					case 'm': output += formatNumber('m', date.month(), 2); break;
					case 'M': output += formatName('M', date.month() - this.minMonth,
						monthNamesShort, monthNames); break;
					case 'y':
						output += (doubled('y', 2) ? date.year() :
							(date.year() % 100 < 10 ? '0' : '') + date.year() % 100);
						break;
					case 'Y':
						doubled('Y', 2);
						output += date.formatYear();
						break;
					case 'J': output += date.toJD(); break;
					case '@': output += (date.toJD() - this.UNIX_EPOCH) * this.SECS_PER_DAY; break;
					case '!': output += (date.toJD() - this.TICKS_EPOCH) * this.TICKS_PER_DAY; break;
					case "'":
						if (doubled("'")) {
							output += "'";
						}
						else {
							literal = true;
						}
						break;
					default:
						output += format.charAt(iFormat);
				}
			}
		}
		return output;
	},

	/* Parse a string value into a date object.
	   See formatDate for the possible formats, plus:
	   * - ignore rest of string
	   @param  format    (string) the expected format of the date ('' for default calendar format)
	   @param  value     (string) the date in the above format
	   @param  settings  (object) attributes include:
	                     shortYearCutoff  (number) the cutoff year for determining the century (optional)
	                     dayNamesShort    (string[]) abbreviated names of the days from Sunday (optional)
	                     dayNames         (string[]) names of the days from Sunday (optional)
	                     monthNamesShort  (string[]) abbreviated names of the months (optional)
	                     monthNames       (string[]) names of the months (optional)
	   @return  (CDate) the extracted date value or null if value is blank
	   @throws  errors if the format and/or value are missing,
	            if the value doesn't match the format,
	            or if the date is invalid */
	parseDate: function(format, value, settings) {
		if (value == null) {
			throw $.calendars.local.invalidArguments || $.calendars.regional[''].invalidArguments;
		}
		value = (typeof value == 'object' ? value.toString() : value + '');
		if (value == '') {
			return null;
		}
		format = format || this.local.dateFormat;
		settings = settings || {};
		var shortYearCutoff = settings.shortYearCutoff || this.shortYearCutoff;
		shortYearCutoff = (typeof shortYearCutoff != 'string' ? shortYearCutoff :
			this.today().year() % 100 + parseInt(shortYearCutoff, 10));
		var dayNamesShort = settings.dayNamesShort || this.local.dayNamesShort;
		var dayNames = settings.dayNames || this.local.dayNames;
		var monthNamesShort = settings.monthNamesShort || this.local.monthNamesShort;
		var monthNames = settings.monthNames || this.local.monthNames;
		var jd = -1;
		var year = -1;
		var month = -1;
		var day = -1;
		var doy = -1;
		var shortYear = false;
		var literal = false;
		// Check whether a format character is doubled
		var doubled = function(match, step) {
			var matches = 1;
			while (iFormat + matches < format.length && format.charAt(iFormat + matches) == match) {
				matches++;
			}
			iFormat += matches - 1;
			return Math.floor(matches / (step || 1)) > 1;
		};
		// Extract a number from the string value
		var getNumber = function(match, step) {
			var isDoubled = doubled(match, step);
			var size = [2, 3, isDoubled ? 4 : 2, isDoubled ? 4 : 2, 10, 11, 20]['oyYJ@!'.indexOf(match) + 1];
			var digits = new RegExp('^-?\\d{1,' + size + '}');
			var num = value.substring(iValue).match(digits);
			if (!num) {
				throw ($.calendars.local.missingNumberAt || $.calendars.regional[''].missingNumberAt).
					replace(/\{0\}/, iValue);
			}
			iValue += num[0].length;
			return parseInt(num[0], 10);
		};
		// Extract a name from the string value and convert to an index
		var calendar = this;
		var getName = function(match, shortNames, longNames, step) {
			var names = (doubled(match, step) ? longNames : shortNames);
			for (var i = 0; i < names.length; i++) {
				if ((value.substr(iValue, names[i].length)).toLowerCase() == names[i].toLowerCase()) {
					iValue += names[i].length;
					return i + calendar.minMonth;
				}
			}
			throw ($.calendars.local.unknownNameAt || $.calendars.regional[''].unknownNameAt).
				replace(/\{0\}/, iValue);
		};
		// Confirm that a literal character matches the string value
		var checkLiteral = function() {
			if (value.charAt(iValue) != format.charAt(iFormat)) {
				throw ($.calendars.local.unexpectedLiteralAt ||
					$.calendars.regional[''].unexpectedLiteralAt).replace(/\{0\}/, iValue);
			}
			iValue++;
		};
		var iValue = 0;
		for (var iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) == "'" && !doubled("'")) {
					literal = false;
				}
				else {
					checkLiteral();
				}
			}
			else {
				switch (format.charAt(iFormat)) {
					case 'd': day = getNumber('d'); break;
					case 'D': getName('D', dayNamesShort, dayNames); break;
					case 'o': doy = getNumber('o'); break;
					case 'w': getNumber('w'); break;
					case 'm': month = getNumber('m'); break;
					case 'M': month = getName('M', monthNamesShort, monthNames); break;
					case 'y':
						var iSave = iFormat;
						shortYear = !doubled('y', 2);
						iFormat = iSave;
						year = getNumber('y', 2);
						break;
					case 'Y': year = getNumber('Y', 2); break;
					case 'J':
						jd = getNumber('J') + 0.5;
						if (value.charAt(iValue) == '.') {
							iValue++;
							getNumber('J');
						}
						break;
					case '@': jd = getNumber('@') / this.SECS_PER_DAY + this.UNIX_EPOCH; break;
					case '!': jd = getNumber('!') / this.TICKS_PER_DAY + this.TICKS_EPOCH; break;
					case '*': iValue = value.length; break;
					case "'":
						if (doubled("'")) {
							checkLiteral();
						}
						else {
							literal = true;
						}
						break;
					default: checkLiteral();
				}
			}
		}
		if (iValue < value.length) {
			throw $.calendars.local.unexpectedText || $.calendars.regional[''].unexpectedText;
		}
		if (year == -1) {
			year = this.today().year();
		}
		else if (year < 100 && shortYear) {
			year += (shortYearCutoff == -1 ? 1900 : this.today().year() -
				this.today().year() % 100 - (year <= shortYearCutoff ? 0 : 100));
		}
		if (doy > -1) {
			month = 1;
			day = doy;
			for (var dim = this.daysInMonth(year, month); day > dim; dim = this.daysInMonth(year, month)) {
				month++;
				day -= dim;
			}
		}
		return (jd > -1 ? this.fromJD(jd) : this.newDate(year, month, day));
	},

	/* A date may be specified as an exact value or a relative one.
	   @param  dateSpec     (CDate or number or string) the date as an object or string
	                        in the given format or an offset - numeric days from today,
	                        or string amounts and periods, e.g. '+1m +2w'
	   @param  defaultDate  (CDate) the date to use if no other supplied, may be null
	   @param  currentDate  (CDate) the current date as a possible basis for relative dates,
	                        if null today is used (optional)
	   @param  dateFormat   (string) the expected date format - see formatDate above (optional)
	   @param  settings     (object) attributes include:
	                        shortYearCutoff  (number) the cutoff year for determining the century (optional)
	                        dayNamesShort    (string[7]) abbreviated names of the days from Sunday (optional)
	                        dayNames         (string[7]) names of the days from Sunday (optional)
	                        monthNamesShort  (string[12]) abbreviated names of the months (optional)
	                        monthNames       (string[12]) names of the months (optional)
	   @return  (CDate) the decoded date */
	determineDate: function(dateSpec, defaultDate, currentDate, dateFormat, settings) {
		if (currentDate && typeof currentDate != 'object') {
			settings = dateFormat;
			dateFormat = currentDate;
			currentDate = null;
		}
		if (typeof dateFormat != 'string') {
			settings = dateFormat;
			dateFormat = '';
		}
		var calendar = this;
		var offsetString = function(offset) {
			try {
				return calendar.parseDate(dateFormat, offset, settings);
			}
			catch (e) {
				// Ignore
			}
			offset = offset.toLowerCase();
			var date = (offset.match(/^c/) && currentDate ?
				currentDate.newDate() : null) || calendar.today();
			var pattern = /([+-]?[0-9]+)\s*(d|w|m|y)?/g;
			var matches = pattern.exec(offset);
			while (matches) {
				date.add(parseInt(matches[1], 10), matches[2] || 'd');
				matches = pattern.exec(offset);
			}
			return date;
		};
		defaultDate = (defaultDate ? defaultDate.newDate() : null);
		dateSpec = (dateSpec == null ? defaultDate :
			(typeof dateSpec == 'string' ? offsetString(dateSpec) : (typeof dateSpec == 'number' ?
			(isNaN(dateSpec) || dateSpec == Infinity || dateSpec == -Infinity ? defaultDate :
			calendar.today().add(dateSpec, 'd')) : calendar.newDate(dateSpec))));
		return dateSpec;
	}
});

})(jQuery);

var process = process || {env: {NODE_ENV: "development"}};
﻿/* http://keith-wood.name/calendars.html
   Calendars date picker for jQuery v1.1.4.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* Calendar picker manager. */
function CalendarsPicker() {
	this._defaults = {
		calendar: $.calendars.instance(), // The calendar to use
		pickerClass: '', // CSS class to add to this instance of the datepicker
		showOnFocus: true, // True for popup on focus, false for not
		showTrigger: null, // Element to be cloned for a trigger, null for none
		showAnim: 'show', // Name of jQuery animation for popup, '' for no animation
		showOptions: {}, // Options for enhanced animations
		showSpeed: 'normal', // Duration of display/closure
		popupContainer: null, // The element to which a popup calendar is added, null for body
		alignment: 'bottom', // Alignment of popup - with nominated corner of input:
			// 'top' or 'bottom' aligns depending on language direction,
			// 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'
		fixedWeeks: false, // True to always show 6 weeks, false to only show as many as are needed
		firstDay: null, // First day of the week, 0 = Sunday, 1 = Monday, ...
			// defaults to calendar local setting if null
		calculateWeek: null, // Calculate week of the year from a date, null for calendar default
		monthsToShow: 1, // How many months to show, cols or [rows, cols]
		monthsOffset: 0, // How many months to offset the primary month by
		monthsToStep: 1, // How many months to move when prev/next clicked
		monthsToJump: 12, // How many months to move when large prev/next clicked
		useMouseWheel: true, // True to use mousewheel if available, false to never use it
		changeMonth: true, // True to change month/year via drop-down, false for navigation only
		yearRange: 'c-10:c+10', // Range of years to show in drop-down: 'any' for direct text entry
			// or 'start:end', where start/end are '+-nn' for relative to today
			// or 'c+-nn' for relative to the currently selected date
			// or 'nnnn' for an absolute year
		showOtherMonths: false, // True to show dates from other months, false to not show them
		selectOtherMonths: false, // True to allow selection of dates from other months too
		defaultDate: null, // Date to show if no other selected
		selectDefaultDate: false, // True to pre-select the default date if no other is chosen
		minDate: null, // The minimum selectable date
		maxDate: null, // The maximum selectable date
		dateFormat: null, // Format for dates, defaults to calendar setting if null
		autoSize: false, // True to size the input field according to the date format
		rangeSelect: false, // Allows for selecting a date range on one date picker
		rangeSeparator: ' - ', // Text between two dates in a range
		multiSelect: 0, // Maximum number of selectable dates, zero for single select
		multiSeparator: ',', // Text between multiple dates
		onDate: null, // Callback as a date is added to the datepicker
		onShow: null, // Callback just before a datepicker is shown
		onChangeMonthYear: null, // Callback when a new month/year is selected
		onSelect: null, // Callback when a date is selected
		onClose: null, // Callback when a datepicker is closed
		altField: null, // Alternate field to update in synch with the datepicker
		altFormat: null, // Date format for alternate field, defaults to dateFormat
		constrainInput: true, // True to constrain typed input to dateFormat allowed characters
		commandsAsDateFormat: false, // True to apply formatDate to the command texts
		commands: this.commands // Command actions that may be added to a layout by name
	};
	this.regional = {
		'': {
			renderer: this.defaultRenderer, // The rendering templates
			prevText: '&lt;Prev', // Text for the previous month command
			prevStatus: 'Show the previous month', // Status text for the previous month command
			prevJumpText: '&lt;&lt;', // Text for the previous year command
			prevJumpStatus: 'Show the previous year', // Status text for the previous year command
			nextText: 'Next&gt;', // Text for the next month command
			nextStatus: 'Show the next month', // Status text for the next month command
			nextJumpText: '&gt;&gt;', // Text for the next year command
			nextJumpStatus: 'Show the next year', // Status text for the next year command
			currentText: 'Current', // Text for the current month command
			currentStatus: 'Show the current month', // Status text for the current month command
			todayText: 'Today', // Text for the today's month command
			todayStatus: 'Show today\'s month', // Status text for the today's month command
			clearText: 'Clear', // Text for the clear command
			clearStatus: 'Clear all the dates', // Status text for the clear command
			closeText: 'Close', // Text for the close command
			closeStatus: 'Close the datepicker', // Status text for the close command
			yearStatus: 'Change the year', // Status text for year selection
			monthStatus: 'Change the month', // Status text for month selection
			weekText: 'Wk', // Text for week of the year column header
			weekStatus: 'Week of the year', // Status text for week of the year column header
			dayStatus: 'Select DD, M d, yyyy', // Status text for selectable days
			defaultStatus: 'Select a date', // Status text shown by default
			isRTL: false // True if language is right-to-left
		}};
	$.extend(this._defaults, this.regional['']);
	this._disabled = [];
}

$.extend(CalendarsPicker.prototype, {
	dataName: 'calendarsPicker',
	
	/* Class name added to elements to indicate already configured with calendar picker. */
	markerClass: 'hasCalendarsPicker',

	_popupClass: 'calendars-popup', // Marker for popup division
	_triggerClass: 'calendars-trigger', // Marker for trigger element
	_disableClass: 'calendars-disable', // Marker for disabled element
	_coverClass: 'calendars-cover', // Marker for iframe backing element
	_monthYearClass: 'calendars-month-year', // Marker for month/year inputs
	_curMonthClass: 'calendars-month-', // Marker for current month/year
	_anyYearClass: 'calendars-any-year', // Marker for year direct input
	_curDoWClass: 'calendars-dow-', // Marker for day of week
	
	commands: { // Command actions that may be added to a layout by name
		// name: { // The command name, use '{button:name}' or '{link:name}' in layouts
		//		text: '', // The field in the regional settings for the displayed text
		//		status: '', // The field in the regional settings for the status text
		//      // The keystroke to trigger the action
		//		keystroke: {keyCode: nn, ctrlKey: boolean, altKey: boolean, shiftKey: boolean},
		//		enabled: fn, // The function that indicates the command is enabled
		//		date: fn, // The function to get the date associated with this action
		//		action: fn} // The function that implements the action
		prev: {text: 'prevText', status: 'prevStatus', // Previous month
			keystroke: {keyCode: 33}, // Page up
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || inst.drawDate.newDate().
					add(1 - inst.get('monthsToStep') - inst.get('monthsOffset'), 'm').
					day(inst.get('calendar').minDay).add(-1, 'd').compareTo(minDate) != -1); },
			date: function(inst) {
				return inst.drawDate.newDate().
					add(-inst.get('monthsToStep') - inst.get('monthsOffset'), 'm').
					day(inst.get('calendar').minDay); },
			action: function(inst) {
				$.calendars.picker.changeMonth(this, -inst.get('monthsToStep')); }
		},
		/*prevJump: {text: 'prevJumpText', status: 'prevJumpStatus', // Previous year
			keystroke: {keyCode: 33, ctrlKey: true}, // Ctrl + Page up
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || inst.drawDate.newDate().
					add(1 - inst.get('monthsToJump') - inst.get('monthsOffset'), 'm').
					day(inst.get('calendar').minDay).add(-1, 'd').compareTo(minDate) != -1); },
			date: function(inst) {
				return inst.drawDate.newDate().
					add(-inst.get('monthsToJump') - inst.get('monthsOffset'), 'm').
					day(inst.get('calendar').minDay); },
			action: function(inst) {
				$.calendars.picker.changeMonth(this, -inst.get('monthsToJump')); }
		},*/
		next: {text: 'nextText', status: 'nextStatus', // Next month
			keystroke: {keyCode: 34}, // Page down
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || inst.drawDate.newDate().
					add(inst.get('monthsToStep') - inst.get('monthsOffset'), 'm').
					day(inst.get('calendar').minDay).compareTo(maxDate) != +1); },
			date: function(inst) {
				return inst.drawDate.newDate().
					add(inst.get('monthsToStep') - inst.get('monthsOffset'), 'm').
					day(inst.get('calendar').minDay); },
			action: function(inst) {
				$.calendars.picker.changeMonth(this, inst.get('monthsToStep')); }
		},
		nextJump: {text: 'nextJumpText', status: 'nextJumpStatus', // Next year
			keystroke: {keyCode: 34, ctrlKey: true}, // Ctrl + Page down
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || inst.drawDate.newDate().
					add(inst.get('monthsToJump') - inst.get('monthsOffset'), 'm').
					day(inst.get('calendar').minDay).compareTo(maxDate) != +1);	},
			date: function(inst) {
				return inst.drawDate.newDate().
					add(inst.get('monthsToJump') - inst.get('monthsOffset'), 'm').
					day(inst.get('calendar').minDay); },
			action: function(inst) {
				$.calendars.picker.changeMonth(this, inst.get('monthsToJump')); }
		},
		current: {text: 'currentText', status: 'currentStatus', // Current month
			keystroke: {keyCode: 36, ctrlKey: true}, // Ctrl + Home
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				var maxDate = inst.get('maxDate');
				var curDate = inst.selectedDates[0] || inst.get('calendar').today();
				return (!minDate || curDate.compareTo(minDate) != -1) &&
					(!maxDate || curDate.compareTo(maxDate) != +1); },
			date: function(inst) {
				return inst.selectedDates[0] || inst.get('calendar').today(); },
			action: function(inst) {
				var curDate = inst.selectedDates[0] || inst.get('calendar').today();
				$.calendars.picker.showMonth(this, curDate.year(), curDate.month()); }
		},
		today: {text: 'todayText', status: 'todayStatus', // Today's month
			keystroke: {keyCode: 36, ctrlKey: true}, // Ctrl + Home
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				var maxDate = inst.get('maxDate');
				return (!minDate || inst.get('calendar').today().compareTo(minDate) != -1) &&
					(!maxDate || inst.get('calendar').today().compareTo(maxDate) != +1); },
			date: function(inst) { return inst.get('calendar').today(); },
			action: function(inst) { $.calendars.picker.showMonth(this); }
		},
		clear: {text: 'clearText', status: 'clearStatus', // Clear the datepicker
			keystroke: {keyCode: 35, ctrlKey: true}, // Ctrl + End
			enabled: function(inst) { return true; },
			date: function(inst) { return null; },
			action: function(inst) { $.calendars.picker.clear(this); }
		},
		close: {text: 'closeText', status: 'closeStatus', // Close the datepicker
			keystroke: {keyCode: 27}, // Escape
			enabled: function(inst) { return true; },
			date: function(inst) { return null; },
			action: function(inst) { $.calendars.picker.hide(this); }
		},
		prevWeek: {text: 'prevWeekText', status: 'prevWeekStatus', // Previous week
			keystroke: {keyCode: 38, ctrlKey: true}, // Ctrl + Up
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || inst.drawDate.newDate().
					add(-inst.get('calendar').daysInWeek(), 'd').compareTo(minDate) != -1); },
			date: function(inst) { return inst.drawDate.newDate().
				add(-inst.get('calendar').daysInWeek(), 'd'); },
			action: function(inst) { $.calendars.picker.changeDay(
				this, -inst.get('calendar').daysInWeek()); }
		},
		prevDay: {text: 'prevDayText', status: 'prevDayStatus', // Previous day
			keystroke: {keyCode: 37, ctrlKey: true}, // Ctrl + Left
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || inst.drawDate.newDate().add(-1, 'd').
					compareTo(minDate) != -1); },
			date: function(inst) { return inst.drawDate.newDate().add(-1, 'd'); },
			action: function(inst) { $.calendars.picker.changeDay(this, -1); }
		},
		nextDay: {text: 'nextDayText', status: 'nextDayStatus', // Next day
			keystroke: {keyCode: 39, ctrlKey: true}, // Ctrl + Right
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || inst.drawDate.newDate().add(1, 'd').
					compareTo(maxDate) != +1); },
			date: function(inst) { return inst.drawDate.newDate().add(1, 'd'); },
			action: function(inst) { $.calendars.picker.changeDay(this, 1); }
		},
		nextWeek: {text: 'nextWeekText', status: 'nextWeekStatus', // Next week
			keystroke: {keyCode: 40, ctrlKey: true}, // Ctrl + Down
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || inst.drawDate.newDate().
					add(inst.get('calendar').daysInWeek(), 'd').compareTo(maxDate) != +1); },
			date: function(inst) { return inst.drawDate.newDate().
				add(inst.get('calendar').daysInWeek(), 'd'); },
			action: function(inst) { $.calendars.picker.changeDay(
				this, inst.get('calendar').daysInWeek()); }
		}
	},

	/* Default template for generating a calendar picker. */
	defaultRenderer: {
		// Anywhere: '{l10n:name}' to insert localised value for name,
		// '{link:name}' to insert a link trigger for command name,
		// '{button:name}' to insert a button trigger for command name,
		// '{popup:start}...{popup:end}' to mark a section for inclusion in a popup datepicker only,
		// '{inline:start}...{inline:end}' to mark a section for inclusion in an inline datepicker only
		// Overall structure: '{months}' to insert calendar months
		picker: '<div class="calendars">' +
		'<div class="calendars-nav">{link:prev}{link:today}{link:next}</div>{months}' +
		'{popup:start}<div class="calendars-ctrl">{link:clear}{link:close}</div>{popup:end}' +
		'<div class="calendars-clear-fix"></div></div>',
		// One row of months: '{months}' to insert calendar months
		monthRow: '<div class="calendars-month-row">{months}</div>',
		// A single month: '{monthHeader:dateFormat}' to insert the month header -
		// dateFormat is optional and defaults to 'MM yyyy',
		// '{weekHeader}' to insert a week header, '{weeks}' to insert the month's weeks
		month: '<div class="calendars-month"><div class="calendars-month-header">{monthHeader}</div>' +
		'<table><thead>{weekHeader}</thead><tbody>{weeks}</tbody></table></div>',
		// A week header: '{days}' to insert individual day names
		weekHeader: '<tr class="ui-datepicker-daynames">{days}</tr>',
		// Individual day header: '{day}' to insert day name
		dayHeader: '<th>{day}</th>',
		// One week of the month: '{days}' to insert the week's days, '{weekOfYear}' to insert week of year
		week: '<tr>{days}</tr>',
		// An individual day: '{day}' to insert day value
		day: '<td>{day}</td>',
		// jQuery selector, relative to picker, for a single month
		monthSelector: '.calendars-month',
		// jQuery selector, relative to picker, for individual days
		daySelector: 'td',
		// Class for right-to-left (RTL) languages
		rtlClass: 'calendars-rtl',
		// Class for multi-month datepickers
		multiClass: 'calendars-multi',
		// Class for selectable dates
		defaultClass: '',
		// Class for currently selected dates
		selectedClass: 'calendars-selected',
		// Class for highlighted dates
		highlightedClass: 'calendars-highlight',
		// Class for today
		todayClass: 'calendars-today',
		// Class for days from other months
		otherMonthClass: 'calendars-other-month',
		// Class for days on weekends
		weekendClass: 'calendars-weekend',
		// Class prefix for commands
		commandClass: 'calendars-cmd',
		// Extra class(es) for commands that are buttons
		commandButtonClass: '',
		// Extra class(es) for commands that are links
		commandLinkClass: '',
		// Class for disabled commands
		disabledClass: 'calendars-disabled'
	},

	/* Override the default settings for all calendar picker instances.
	   @param  settings  (object) the new settings to use as defaults
	   @return  (CalendarPicker) this object */
	setDefaults: function(settings) {
		$.extend(this._defaults, settings || {});
		return this;
	},

	/* Attach the calendar picker functionality to an input field.
	   @param  target    (element) the control to affect
	   @param  settings  (object) the custom options for this instance */
	_attachPicker: function(target, settings) {
		target = $(target);
		if (target.hasClass(this.markerClass)) {
			return;
		}
		target.addClass(this.markerClass);
		var inst = {target: target, selectedDates: [], drawDate: null, pickingRange: false,
			inline: ($.inArray(target[0].nodeName.toLowerCase(), ['div', 'span']) > -1),
			get: function(name) { // Get a setting value, defaulting if necessary
				var value = this.settings[name] !== undefined ?
					this.settings[name] : $.calendars.picker._defaults[name];
				if ($.inArray(name, ['defaultDate', 'minDate', 'maxDate']) > -1) { // Decode date settings
					value = this.get('calendar').determineDate(
						value, null, this.selectedDates[0], this.get('dateFormat'), inst.getConfig());
				}
				else if (name == 'dateFormat') {
					value = value || this.get('calendar').local.dateFormat;
				}
				return value;
			},
			curMinDate: function() {
				return (this.pickingRange ? this.selectedDates[0] : this.get('minDate'));
			},
			getConfig: function() {
				return {dayNamesShort: this.get('dayNamesShort'), dayNames: this.get('dayNames'),
					monthNamesShort: this.get('monthNamesShort'), monthNames: this.get('monthNames'),
					calculateWeek: this.get('calculateWeek'),
					shortYearCutoff: this.get('shortYearCutoff')};
			}
		};
		$.data(target[0], this.dataName, inst);
		var inlineSettings = ($.fn.metadata ? target.metadata() : {});
		inst.settings = $.extend({}, settings || {}, inlineSettings || {});
		if (inst.inline) {
			this._update(target[0]);
			if ($.fn.mousewheel) {
				target.mousewheel(this._doMouseWheel);
			}
		}
		else {
			this._attachments(target, inst);
			target.bind('keydown.' + this.dataName, this._keyDown).
				bind('keypress.' + this.dataName, this._keyPress).
				bind('keyup.' + this.dataName, this._keyUp);
			if (target.attr('disabled')) {
				this.disable(target[0]);
			}
		}
	},

	/* Retrieve the settings for a calendar picker control.
	   @param  target  (element) the control to affect
	   @param  name    (string) the name of the setting (optional)
	   @return  (object) the current instance settings (name == 'all') or
	            (object) the default settings (no name) or
	            (any) the setting value (name supplied) */
	options: function(target, name) {
		var inst = $.data(target, this.dataName);
		return (inst ? (name ? (name == 'all' ?
			inst.settings : inst.settings[name]) : $.calendars.picker._defaults) : {});
	},

	/* Reconfigure the settings for a calendar picker control.
	   @param  target    (element) the control to affect
	   @param  settings  (object) the new options for this instance or
	                     (string) an individual property name
	   @param  value     (any) the individual property value (omit if settings is an object) */
	option: function(target, settings, value) {
		target = $(target);
		if (!target.hasClass(this.markerClass)) {
			return;
		}
		settings = settings || {};
		if (typeof settings == 'string') {
			var name = settings;
			settings = {};
			settings[name] = value;
		}
		var inst = $.data(target[0], this.dataName);
		if (settings.calendar && settings.calendar != inst.get('calendar')) {
			var discardDate = function(name) {
				return (typeof inst.settings[name] == 'object' ? null : inst.settings[name]);
			};
			settings = $.extend({defaultDate: discardDate('defaultDate'),
				minDate: discardDate('minDate'), maxDate: discardDate('maxDate')}, settings);
			inst.selectedDates = [];
			inst.drawDate = null;
		}
		var dates = inst.selectedDates;
		extendRemove(inst.settings, settings);
		this.setDate(target[0], dates, null, false, true);
		inst.pickingRange = false;
		var calendar = inst.get('calendar');
		inst.drawDate = this._checkMinMax(
			(settings.defaultDate ? inst.get('defaultDate') : inst.drawDate) ||
			inst.get('defaultDate') || calendar.today(), inst).newDate();
		if (!inst.inline) {
			this._attachments(target, inst);
		}
		if (inst.inline || inst.div) {
			this._update(target[0]);
		}
	},

	/* Attach events and trigger, if necessary.
	   @param  target  (jQuery) the control to affect
	   @param  inst    (object) the current instance settings */
	_attachments: function(target, inst) {
		target.unbind('focus.' + this.dataName);
		if (inst.get('showOnFocus')) {
			target.bind('focus.' + this.dataName, this.show);
		}
		if (inst.trigger) {
			inst.trigger.remove();
		}
		var trigger = inst.get('showTrigger');
		inst.trigger = (!trigger ? $([]) :
			$(trigger).clone().addClass(this._triggerClass)
				[inst.get('isRTL') ? 'insertBefore' : 'insertAfter'](target).
				click(function() {
					if (!$.calendars.picker.isDisabled(target[0])) {
						$.calendars.picker[$.calendars.picker.curInst == inst ?
							'hide' : 'show'](target[0]);
					}
				}));
		this._autoSize(target, inst);
		var dates = this._extractDates(inst, target.val());
		if (dates) {
			this.setDate(target[0], dates, null, true);
		}
		if (inst.get('selectDefaultDate') && inst.get('defaultDate') &&
				inst.selectedDates.length == 0) {
			var calendar = inst.get('calendar');
			this.setDate(target[0], 
				(inst.get('defaultDate') || calendar.today()).newDate());
		}
	},

	/* Apply the maximum length for the date format.
	   @param  inst  (object) the current instance settings */
	_autoSize: function(target, inst) {
		if (inst.get('autoSize') && !inst.inline) {
			var calendar = inst.get('calendar');
			var date = calendar.newDate(2009, 10, 20); // Ensure double digits
			var dateFormat = inst.get('dateFormat');
			if (dateFormat.match(/[DM]/)) {
				var findMax = function(names) {
					var max = 0;
					var maxI = 0;
					for (var i = 0; i < names.length; i++) {
						if (names[i].length > max) {
							max = names[i].length;
							maxI = i;
						}
					}
					return maxI;
				};
				date.month(findMax(calendar.local[dateFormat.match(/MM/) ? // Longest month
					'monthNames' : 'monthNamesShort']) + 1);
				date.day(findMax(calendar.local[dateFormat.match(/DD/) ? // Longest day
					'dayNames' : 'dayNamesShort']) + 20 - date.dayOfWeek());
			}
			inst.target.attr('size', date.formatDate(dateFormat).length);
		}
	},

	/* Remove the calendar picker functionality from a control.
	   @param  target  (element) the control to affect */
	destroy: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClass)) {
			return;
		}
		var inst = $.data(target[0], this.dataName);
		if (inst.trigger) {
			inst.trigger.remove();
		}
		target.removeClass(this.markerClass).empty().unbind('.' + this.dataName);
		if (inst.inline && $.fn.mousewheel) {
			target.unmousewheel();
		}
		if (!inst.inline && inst.get('autoSize')) {
			target.removeAttr('size');
		}
		$.removeData(target[0], this.dataName);
	},

	/* Apply multiple event functions.
	   Usage, for example: onShow: multipleEvents(fn1, fn2, ...)
	   @param  fns  (function...) the functions to apply */
	multipleEvents: function(fns) {
		var funcs = arguments;
		return function(args) {
			for (var i = 0; i < funcs.length; i++) {
				funcs[i].apply(this, arguments);
			}
		};
	},

	/* Enable the datepicker and any associated trigger.
	   @param  target  (element) the control to use */
	enable: function(target) {
		var $target = $(target);
		if (!$target.hasClass(this.markerClass)) {
			return;
		}
		var inst = $.data(target, this.dataName);
		if (inst.inline)
			$target.children('.' + this._disableClass).remove().end().
				find('button,select').attr('disabled', '').end().
				find('a').attr('href', 'javascript:void(0)');
		else {
			target.disabled = false;
			inst.trigger.filter('button.' + this._triggerClass).
				attr('disabled', '').end().
				filter('img.' + this._triggerClass).
				css({opacity: '1.0', cursor: ''});
		}
		this._disabled = $.map(this._disabled,
			function(value) { return (value == target ? null : value); }); // Delete entry
	},

	/* Disable the datepicker and any associated trigger.
	   @param  target  (element) the control to use */
	disable: function(target) {
		var $target = $(target);
		if (!$target.hasClass(this.markerClass))
			return;
		var inst = $.data(target, this.dataName);
		if (inst.inline) {
			var inline = $target.children(':last');
			var offset = inline.offset();
			var relOffset = {left: 0, top: 0};
			inline.parents().each(function() {
				if ($(this).css('position') == 'relative') {
					relOffset = $(this).offset();
					return false;
				}
			});
			var zIndex = $target.css('zIndex');
			zIndex = (zIndex == 'auto' ? 0 : parseInt(zIndex, 10)) + 1;
			$target.prepend('<div class="' + this._disableClass + '" style="' +
				'width: ' + inline.outerWidth() + 'px; height: ' + inline.outerHeight() +
				'px; left: ' + (offset.left - relOffset.left) + 'px; top: ' +
				(offset.top - relOffset.top) + 'px; z-index: ' + zIndex + '"></div>').
				find('button,select').attr('disabled', 'disabled').end().
				find('a').removeAttr('href');
		}
		else {
			target.disabled = true;
			inst.trigger.filter('button.' + this._triggerClass).
				attr('disabled', 'disabled').end().
				filter('img.' + this._triggerClass).
				css({opacity: '0.5', cursor: 'default'});
		}
		this._disabled = $.map(this._disabled,
			function(value) { return (value == target ? null : value); }); // Delete entry
		this._disabled.push(target);
	},

	/* Is the first field in a jQuery collection disabled as a datepicker?
	   @param  target  (element) the control to examine
	   @return  (boolean) true if disabled, false if enabled */
	isDisabled: function(target) {
		return (target && $.inArray(target, this._disabled) > -1);
	},

	/* Show a popup datepicker.
	   @param  target  (event) a focus event or
	                   (element) the control to use */
	show: function(target) {
		target = target.target || target;
		var inst = $.data(target, $.calendars.picker.dataName);
		if ($.calendars.picker.curInst == inst) {
			return;
		}
		if ($.calendars.picker.curInst) {
			$.calendars.picker.hide($.calendars.picker.curInst, true);
		}
		if (inst) {
			// Retrieve existing date(s)
			inst.lastVal = null;
			inst.selectedDates = $.calendars.picker._extractDates(inst, $(target).val());
			inst.pickingRange = false;
			inst.drawDate = $.calendars.picker._checkMinMax((inst.selectedDates[0] ||
				inst.get('defaultDate') || inst.get('calendar').today()).newDate(), inst);
			$.calendars.picker.curInst = inst;
			// Generate content
			$.calendars.picker._update(target, true);
			// Adjust position before showing
			var offset = $.calendars.picker._checkOffset(inst);
			inst.div.css({left: offset.left, top: offset.top});
			// And display
			var showAnim = inst.get('showAnim');
			var showSpeed = inst.get('showSpeed');
			showSpeed = (showSpeed == 'normal' && $.ui && $.ui.version >= '1.8' ?
				'_default' : showSpeed);
			var postProcess = function() {
				var cover = inst.div.find('.' + $.calendars.picker._coverClass); // IE6- only
				if (cover.length) {
					var borders = $.calendars.picker._getBorders(inst.div);
					cover.css({left: -borders[0], top: -borders[1],
						width: inst.div.outerWidth() + borders[0],
						height: inst.div.outerHeight() + borders[1]});
				}
			};
			if ($.effects && $.effects[showAnim]) {
				var data = inst.div.data(); // Update old effects data
				for (var key in data) {
					if (key.match(/^ec\.storage\./)) {
						data[key] = inst._mainDiv.css(key.replace(/ec\.storage\./, ''));
					}
				}
				inst.div.data(data).show(showAnim, inst.get('showOptions'), showSpeed, postProcess);
			}
			else {
				inst.div[showAnim || 'show']((showAnim ? showSpeed : ''), postProcess);
			}
			if (!showAnim) {
				postProcess();
			}
		}
	},

	/* Extract possible dates from a string.
	   @param  inst  (object) the current instance settings
	   @param  text  (string) the text to extract from
	   @return  (CDate[]) the extracted dates */
	_extractDates: function(inst, datesText) {
		if (datesText == inst.lastVal) {
			return;
		}
		inst.lastVal = datesText;
		var calendar = inst.get('calendar');
		var dateFormat = inst.get('dateFormat');
		var multiSelect = inst.get('multiSelect');
		var rangeSelect = inst.get('rangeSelect');
		datesText = datesText.split(multiSelect ? inst.get('multiSeparator') :
			(rangeSelect ? inst.get('rangeSeparator') : '\x00'));
		var dates = [];
		for (var i = 0; i < datesText.length; i++) {
			try {
				var date = calendar.parseDate(dateFormat, datesText[i]);
				if (date) {
					var found = false;
					for (var j = 0; j < dates.length; j++) {
						if (dates[j].compareTo(date) == 0) {
							found = true;
							break;
						}
					}
					if (!found) {
						dates.push(date);
					}
				}
			}
			catch (e) {
				// Ignore
			}
		}
		dates.splice(multiSelect || (rangeSelect ? 2 : 1), dates.length);
		if (rangeSelect && dates.length == 1) {
			dates[1] = dates[0];
		}
		return dates;
	},

	/* Update the datepicker display.
	   @param  target  (event) a focus event or
	                   (element) the control to use
	   @param  hidden  (boolean) true to initially hide the datepicker */
	_update: function(target, hidden) {
		target = $(target.target || target);
		var inst = $.data(target[0], $.calendars.picker.dataName);
		if (inst) {
			if (inst.inline || $.calendars.picker.curInst == inst) {
				var onChange = inst.get('onChangeMonthYear');
				if (onChange && (!inst.prevDate || inst.prevDate.year() != inst.drawDate.year() ||
						inst.prevDate.month() != inst.drawDate.month())) {
					onChange.apply(target[0], [inst.drawDate.year(), inst.drawDate.month()]);
				}
			}
			if (inst.inline) {
				target.html(this._generateContent(target[0], inst));
			}
			else if ($.calendars.picker.curInst == inst) {
				if (!inst.div) {
					inst.div = $('<div></div>').addClass(this._popupClass).
						css({display: (hidden ? 'none' : 'static'), position: 'absolute',
							left: target.offset().left,
							top: target.offset().top + target.outerHeight()}).
						appendTo($(inst.get('popupContainer') || 'body'));
					if ($.fn.mousewheel) {
						inst.div.mousewheel(this._doMouseWheel);
					}
				}
				inst.div.html(this._generateContent(target[0], inst));
				target.focus();
			}
		}
	},

	/* Update the input field and any alternate field with the current dates.
	   @param  target  (element) the control to use
	   @param  keyUp   (boolean, internal) true if coming from keyUp processing */
	_updateInput: function(target, keyUp) {
		var inst = $.data(target, this.dataName);
		if (inst) {
			var value = '';
			var altValue = '';
			var sep = (inst.get('multiSelect') ? inst.get('multiSeparator') :
				inst.get('rangeSeparator'));
			var calendar = inst.get('calendar');
			var dateFormat = inst.get('dateFormat') || calendar.local.dateFormat;
			var altFormat = inst.get('altFormat') || dateFormat;
			for (var i = 0; i < inst.selectedDates.length; i++) {
				value += (keyUp ? '' : (i > 0 ? sep : '') +
					calendar.formatDate(dateFormat, inst.selectedDates[i]));
				altValue += (i > 0 ? sep : '') +
					calendar.formatDate(altFormat, inst.selectedDates[i]);
			}
			if (!inst.inline && !keyUp) {
				$(target).val(value);
			}
			$(inst.get('altField')).val(altValue);
			var onSelect = inst.get('onSelect');
			if (onSelect && !keyUp && !inst.inSelect) {
				inst.inSelect = true; // Prevent endless loops
				onSelect.apply(target, [inst.selectedDates]);
				inst.inSelect = false;
			}
		}
	},

	/* Retrieve the size of left and top borders for an element.
	   @param  elem  (jQuery) the element of interest
	   @return  (number[2]) the left and top borders */
	_getBorders: function(elem) {
		var convert = function(value) {
			//var extra = ($.browser.msie ? 1 : 0);
			//return {thin: 1 + extra, medium: 3 + extra, thick: 5 + extra}[value] || value;
			return {thin: 1, medium: 3, thick: 5}[value] || value;
		};
		return [parseFloat(convert(elem.css('border-left-width'))),
			parseFloat(convert(elem.css('border-top-width')))];
	},

	/* Check positioning to remain on the screen.
	   @param  inst  (object) the current instance settings
	   @return  (object) the updated offset for the datepicker */
	_checkOffset: function(inst) {
		var base = (inst.target.is(':hidden') && inst.trigger ? inst.trigger : inst.target);
		var offset = base.offset();
		var isFixed = false;
		$(inst.target).parents().each(function() {
			isFixed |= $(this).css('position') == 'fixed';
			return !isFixed;
		});
		/*if (isFixed && $.browser.opera) { // Correction for Opera when fixed and scrolled
			offset.left -= document.documentElement.scrollLeft;
			offset.top -= document.documentElement.scrollTop;
		}
		var browserWidth = (!$.browser.mozilla || document.doctype ?
			document.documentElement.clientWidth : 0) || document.body.clientWidth;
		var browserHeight = (!$.browser.mozilla || document.doctype ?
			document.documentElement.clientHeight : 0) || document.body.clientHeight;
		 */
		var browserWidth = $(window).width();
		var browserHeight = $(window).height();
		if (browserWidth == 0) {
			return offset;
		}
		var alignment = inst.get('alignment');
		var isRTL = inst.get('isRTL');
		var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
		var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
		//var above = offset.top - inst.div.outerHeight() -
		//	(isFixed && $.browser.opera ? document.documentElement.scrollTop : 0);
		var above = offset.top - (isFixed ? scrollY : 0) - inst.div.outerHeight();
		var below = offset.top + base.outerHeight();
		var alignL = offset.left;
		//var alignR = offset.left + base.outerWidth() - inst.div.outerWidth() -
		//	(isFixed && $.browser.opera ? document.documentElement.scrollLeft : 0);
		var alignR = offset.left - (isFixed ? scrollX : 0) + base.outerWidth() - inst.div.outerWidth();
		var tooWide = (offset.left + inst.div.outerWidth() - scrollX) > browserWidth;
		var tooHigh = (offset.top + inst.target.outerHeight() + inst.div.outerHeight() -
			scrollY) > browserHeight;
		if (alignment == 'topLeft') {
			offset = {left: alignL, top: above};
		}
		else if (alignment == 'topRight') {
			offset = {left: alignR, top: above};
		}
		else if (alignment == 'bottomLeft') {
			offset = {left: alignL, top: below};
		}
		else if (alignment == 'bottomRight') {
			offset = {left: alignR, top: below};
		}
		else if (alignment == 'top') {
			offset = {left: (isRTL || tooWide ? alignR : alignL), top: above};
		}
		else { // bottom
			offset = {left: (isRTL || tooWide ? alignR : alignL),
				top: (tooHigh ? above : below)};
		}
		offset.left = Math.max((isFixed ? 0 : scrollX), offset.left - (isFixed ? scrollX : 0));
		offset.top = Math.max((isFixed ? 0 : scrollY), offset.top - (isFixed ? scrollY : 0));
		return offset;
	},

	/* Close date picker if clicked elsewhere.
	   @param  event  (MouseEvent) the mouse click to check */
	_checkExternalClick: function(event) {
		if (!$.calendars.picker.curInst) {
			return;
		}
		var target = $(event.target);
		if (!target.parents().andSelf().hasClass($.calendars.picker._popupClass) &&
				!target.hasClass($.calendars.picker.markerClass) &&
				!target.parents().andSelf().hasClass($.calendars.picker._triggerClass)) {
			$.calendars.picker.hide($.calendars.picker.curInst);
		}
	},

	/* Hide a popup datepicker.
	   @param  target     (element) the control to use or
	                      (object) the current instance settings
	   @param  immediate  (boolean) true to close immediately without animation */
	hide: function(target, immediate) {
                if ( !target ) { return; }
		var inst = $.data(target, this.dataName) || target;
		if (inst && inst == $.calendars.picker.curInst) {
			var showAnim = (immediate ? '' : inst.get('showAnim'));
			var showSpeed = inst.get('showSpeed');
			showSpeed = (showSpeed == 'normal' && $.ui && $.ui.version >= '1.8' ?
				'_default' : showSpeed);
			var postProcess = function() {
				inst.div.remove();
				inst.div = null;
				$.calendars.picker.curInst = null;
				var onClose = inst.get('onClose');
				if (onClose) {
					onClose.apply(target, [inst.selectedDates]);

				}
			};
			inst.div.stop();
			if ($.effects && $.effects[showAnim]) {
				inst.div.hide(showAnim, inst.get('showOptions'), showSpeed, postProcess);
			}
			else {
				var hideAnim = (showAnim == 'slideDown' ? 'slideUp' :
					(showAnim == 'fadeIn' ? 'fadeOut' : 'hide'));
				inst.div[hideAnim]((showAnim ? showSpeed : ''), postProcess);
			}
			if (!showAnim) {
				postProcess();
			}
		}
	},

	/* Handle keystrokes in the datepicker.
	   @param  event  (KeyEvent) the keystroke
	   @return  (boolean) true if not handled, false if handled */
	_keyDown: function(event) {
		var target = event.target;
		var inst = $.data(target, $.calendars.picker.dataName);
		var handled = false;
		if (inst.div) {
			if (event.keyCode == 9) { // Tab - close
				$.calendars.picker.hide(target);
			}
			else if (event.keyCode == 13) { // Enter - select
				$.calendars.picker.selectDate(target,
					$('a.' + inst.get('renderer').highlightedClass, inst.div)[0]);
				handled = true;
			}
			else { // Command keystrokes
				var commands = inst.get('commands');
				for (var name in commands) {
					var command = commands[name];
					if (command.keystroke.keyCode == event.keyCode &&
							!!command.keystroke.ctrlKey == !!(event.ctrlKey || event.metaKey) &&
							!!command.keystroke.altKey == event.altKey &&
							!!command.keystroke.shiftKey == event.shiftKey) {
						$.calendars.picker.performAction(target, name);
						handled = true;
						break;
					}
				}
			}
		}
		else { // Show on 'current' keystroke
			var command = inst.get('commands').current;
			if (command.keystroke.keyCode == event.keyCode &&
					!!command.keystroke.ctrlKey == !!(event.ctrlKey || event.metaKey) &&
					!!command.keystroke.altKey == event.altKey &&
					!!command.keystroke.shiftKey == event.shiftKey) {
				$.calendars.picker.show(target);
				handled = true;
			}
		}
		inst.ctrlKey = ((event.keyCode < 48 && event.keyCode != 32) ||
			event.ctrlKey || event.metaKey);
		if (handled) {
			event.preventDefault();
			event.stopPropagation();
		}
		return !handled;
	},

	/* Filter keystrokes in the datepicker.
	   @param  event  (KeyEvent) the keystroke
	   @return  (boolean) true if allowed, false if not allowed */
	_keyPress: function(event) {
		var target = event.target;
		var inst = $.data(target, $.calendars.picker.dataName);
		if (inst && inst.get('constrainInput')) {
			var ch = String.fromCharCode(event.keyCode || event.charCode);
			var allowedChars = $.calendars.picker._allowedChars(inst);
			return (event.metaKey || inst.ctrlKey || ch < ' ' ||
				!allowedChars || allowedChars.indexOf(ch) > -1);
		}
		return true;
	},

	/* Determine the set of characters allowed by the date format.
	   @param  inst  (object) the current instance settings
	   @return  (string) the set of allowed characters, or null if anything allowed */
	_allowedChars: function(inst) {
		var dateFormat = inst.get('dateFormat');
		var allowedChars = (inst.get('multiSelect') ? inst.get('multiSeparator') :
			(inst.get('rangeSelect') ? inst.get('rangeSeparator') : ''));
		var literal = false;
		var hasNum = false;
		for (var i = 0; i < dateFormat.length; i++) {
			var ch = dateFormat.charAt(i);
			if (literal) {
				if (ch == "'" && dateFormat.charAt(i + 1) != "'") {
					literal = false;
				}
				else {
					allowedChars += ch;
				}
			}
			else {
				switch (ch) {
					case 'd': case 'm': case 'o': case 'w':
						allowedChars += (hasNum ? '' : '0123456789'); hasNum = true; break;
					case 'y': case '@': case '!':
						allowedChars += (hasNum ? '' : '0123456789') + '-'; hasNum = true; break;
					case 'J':
						allowedChars += (hasNum ? '' : '0123456789') + '-.'; hasNum = true; break;
					case 'D': case 'M': case 'Y':
						return null; // Accept anything
					case "'":
						if (dateFormat.charAt(i + 1) == "'") {
							allowedChars += "'";
						}
						else {
							literal = true;
						}
						break;
					default:
						allowedChars += ch;
				}
			}
		}
		return allowedChars;
	},

	/* Synchronise datepicker with the field.
	   @param  event  (KeyEvent) the keystroke
	   @return  (boolean) true if allowed, false if not allowed */
	_keyUp: function(event) {
		var target = event.target;
		var inst = $.data(target, $.calendars.picker.dataName);
		if (inst && !inst.ctrlKey && inst.lastVal != inst.target.val()) {
			try {
				var dates = $.calendars.picker._extractDates(inst, inst.target.val());
				if (dates.length > 0) {
					$.calendars.picker.setDate(target, dates, null, true);
				}
			}
			catch (event) {
				// Ignore
			}
		}
		return true;
	},

	/* Increment/decrement month/year on mouse wheel activity.
	   @param  event  (event) the mouse wheel event
	   @param  delta  (number) the amount of change */
	_doMouseWheel: function(event, delta) {
		var target = ($.calendars.picker.curInst && $.calendars.picker.curInst.target[0]) ||
			$(event.target).closest('.' + $.calendars.picker.markerClass)[0];
		if ($.calendars.picker.isDisabled(target)) {
			return;
		}
		var inst = $.data(target, $.calendars.picker.dataName);
		if (inst.get('useMouseWheel')) {
			//delta = ($.browser.opera ? -delta : delta);
			delta = (delta < 0 ? -1 : +1);
			$.calendars.picker.changeMonth(target,
				-inst.get(event.ctrlKey ? 'monthsToJump' : 'monthsToStep') * delta);
		}
		event.preventDefault();
	},

	/* Clear an input and close a popup datepicker.
	   @param  target  (element) the control to use */
	clear: function(target) {
		var inst = $.data(target, this.dataName);
		if (inst) {
			inst.selectedDates = [];
			this.hide(target);
			if (inst.get('selectDefaultDate') && inst.get('defaultDate')) {
				var calendar = inst.get('calendar');
				this.setDate(target, (inst.get('defaultDate') || calendar.today()).newDate());
			}
			else {
				this._updateInput(target);
			}
		}
	},

	/* Retrieve the selected date(s) for a calendar picker.
	   @param  target  (element) the control to examine
	   @return  (CDate[]) the selected date(s) */
	getDate: function(target) {
		var inst = $.data(target, this.dataName);
		return (inst ? inst.selectedDates : []);
	},

	/* Set the selected date(s) for a calendar picker.
	   @param  target   (element) the control to examine
	   @param  dates    (CDate or number or string or [] of these) the selected date(s)
	   @param  endDate  (CDate or number or string) the ending date for a range (optional)
	   @param  keyUp    (boolean, internal) true if coming from keyUp processing
	   @param  setOpt   (boolean, internal) true if coming from option processing */
	setDate: function(target, dates, endDate, keyUp, setOpt) {
		var inst = $.data(target, this.dataName);
		if (inst) {
			if (!$.isArray(dates)) {
				dates = [dates];
				if (endDate) {
					dates.push(endDate);
				}
			}
			var calendar = inst.get('calendar');
			var dateFormat = inst.get('dateFormat');
			var minDate = inst.get('minDate');
			var maxDate = inst.get('maxDate');
			var curDate = inst.selectedDates[0];
			inst.selectedDates = [];
			for (var i = 0; i < dates.length; i++) {
				var date = calendar.determineDate(
					dates[i], null, curDate, dateFormat, inst.getConfig());
				if (date) {
					if ((!minDate || date.compareTo(minDate) != -1) &&
							(!maxDate || date.compareTo(maxDate) != +1)) {
						var found = false;
						for (var j = 0; j < inst.selectedDates.length; j++) {
							if (inst.selectedDates[j].compareTo(date) == 0) {
								found = true;
								break;
							}
						}
						if (!found) {
							inst.selectedDates.push(date);
						}
					}
				}
			}
			var rangeSelect = inst.get('rangeSelect');
			inst.selectedDates.splice(inst.get('multiSelect') ||
				(rangeSelect ? 2 : 1), inst.selectedDates.length);
			if (rangeSelect) {
				switch (inst.selectedDates.length) {
					case 1: inst.selectedDates[1] = inst.selectedDates[0]; break;
					case 2: inst.selectedDates[1] =
						(inst.selectedDates[0].compareTo(inst.selectedDates[1]) == +1 ?
						inst.selectedDates[0] : inst.selectedDates[1]); break;
				}
				inst.pickingRange = false;
			}
			inst.prevDate = (inst.drawDate ? inst.drawDate.newDate() : null);
			inst.drawDate = this._checkMinMax((inst.selectedDates[0] ||
				inst.get('defaultDate') || calendar.today()).newDate(), inst);
			if (!setOpt) {
				this._update(target);
				this._updateInput(target, keyUp);
			}
		}
	},

	/* Determine whether a date is selectable for this datepicker.
	   @param  target  (element) the control to check
	   @param  date    (Date or string or number) the date to check
	   @return  (boolean) true if selectable, false if not */
	isSelectable: function(target, date) {
		var inst = $.data(target, this.dataName);
		if (!inst) {
			return false;
		}
		date = inst.get('calendar').determineDate(date,
			inst.selectedDates[0] || inst.get('calendar').today(), null,
			inst.get('dateFormat'), inst.getConfig());
		return this._isSelectable(target, date, inst.get('onDate'),
			inst.get('minDate'), inst.get('maxDate'));
	},

	/* Internally determine whether a date is selectable for this datepicker.
	   @param  target   (element) the control to check
	   @param  date     (Date) the date to check
	   @param  onDate   (function or boolean) any onDate callback or callback.selectable
	   @param  mindate  (Date) the minimum allowed date
	   @param  maxdate  (Date) the maximum allowed date
	   @return  (boolean) true if selectable, false if not */
	_isSelectable: function(target, date, onDate, minDate, maxDate) {
		var dateInfo = (typeof onDate == 'boolean' ? {selectable: onDate} :
			(!onDate ? {} : onDate.apply(target, [date, true])));
		return (dateInfo.selectable != false) &&
			(!minDate || date.toJD() >= minDate.toJD()) &&
			(!maxDate || date.toJD() <= maxDate.toJD());
	},

	/* Perform a named action for a calendar picker.
	   @param  target  (element) the control to affect
	   @param  action  (string) the name of the action */
	performAction: function(target, action) {
		var inst = $.data(target, this.dataName);
		if (inst && !this.isDisabled(target)) {
			var commands = inst.get('commands');
			if (commands[action] && commands[action].enabled.apply(target, [inst])) {
				commands[action].action.apply(target, [inst]);
			}
		}
	},

	/* Set the currently shown month, defaulting to today's.
	   @param  target  (element) the control to affect
	   @param  year    (number) the year to show (optional)
	   @param  month   (number) the month to show (optional)
	   @param  day     (number) the day to show (optional) */
	showMonth: function(target, year, month, day) {
		var inst = $.data(target, this.dataName);
		if (inst && (day != null ||
				(inst.drawDate.year() != year || inst.drawDate.month() != month))) {
			inst.prevDate = inst.drawDate.newDate();
			var calendar = inst.get('calendar');
			var show = this._checkMinMax((year != null ?
				calendar.newDate(year, month, 1) : calendar.today()), inst);
			inst.drawDate.date(show.year(), show.month(), 
				(day != null ? day : Math.min(inst.drawDate.day(),
				calendar.daysInMonth(show.year(), show.month()))));
			this._update(target);
		}
	},

	/* Adjust the currently shown month.
	   @param  target  (element) the control to affect
	   @param  offset  (number) the number of months to change by */
	changeMonth: function(target, offset) {
		var inst = $.data(target, this.dataName);
		if (inst) {
			var date = inst.drawDate.newDate().add(offset, 'm');
			this.showMonth(target, date.year(), date.month());
		}
	},

	/* Adjust the currently shown day.
	   @param  target  (element) the control to affect
	   @param  offset  (number) the number of days to change by */
	changeDay: function(target, offset) {
		var inst = $.data(target, this.dataName);
		if (inst) {
			var date = inst.drawDate.newDate().add(offset, 'd');
			this.showMonth(target, date.year(), date.month(), date.day());
		}
	},

	/* Restrict a date to the minimum/maximum specified.
	   @param  date  (CDate) the date to check
	   @param  inst  (object) the current instance settings */
	_checkMinMax: function(date, inst) {
		var minDate = inst.get('minDate');
		var maxDate = inst.get('maxDate');
		date = (minDate && date.compareTo(minDate) == -1 ? minDate.newDate() : date);
		date = (maxDate && date.compareTo(maxDate) == +1 ? maxDate.newDate() : date);
		return date;
	},

	/* Retrieve the date associated with an entry in the datepicker.
	   @param  target  (element) the control to examine
	   @param  elem    (element) the selected datepicker element
	   @return  (CDate) the corresponding date, or null */
	retrieveDate: function(target, elem) {
		var inst = $.data(target, this.dataName);
		return (!inst ? null : inst.get('calendar').fromJD(
			parseFloat(elem.className.replace(/^.*jd(\d+\.5).*$/, '$1'))));
	},

	/* Select a date for this datepicker.
	   @param  target  (element) the control to examine
	   @param  elem    (element) the selected datepicker element */
	selectDate: function(target, elem) {
		var inst = $.data(target, this.dataName);
		if (inst && !this.isDisabled(target)) {
			var date = this.retrieveDate(target, elem);
			var multiSelect = inst.get('multiSelect');
			var rangeSelect = inst.get('rangeSelect');
			if (multiSelect) {
				var found = false;
				for (var i = 0; i < inst.selectedDates.length; i++) {
					if (date.compareTo(inst.selectedDates[i]) == 0) {
						inst.selectedDates.splice(i, 1);
						found = true;
						break;
					}
				}
				if (!found && inst.selectedDates.length < multiSelect) {
					inst.selectedDates.push(date);
				}
			}
			else if (rangeSelect) {
				if (inst.pickingRange) {
					inst.selectedDates[1] = date;
				}
				else {
					inst.selectedDates = [date, date];
				}
				inst.pickingRange = !inst.pickingRange;
			}
			else {
				inst.selectedDates = [date];
			}
			this._updateInput(target);
			if (inst.inline || inst.pickingRange || inst.selectedDates.length <
					(multiSelect || (rangeSelect ? 2 : 1))) {
				this._update(target);
			}
			else {
				this.hide(target);
			}
		}
	},

	/* Generate the datepicker content for this control.
	   @param  target  (element) the control to affect
	   @param  inst    (object) the current instance settings
	   @return  (jQuery) the datepicker content */
	_generateContent: function(target, inst) {
		var calendar = inst.get('calendar');
		var renderer = inst.get('renderer');
		var monthsToShow = inst.get('monthsToShow');
		monthsToShow = ($.isArray(monthsToShow) ? monthsToShow : [1, monthsToShow]);
		inst.drawDate = this._checkMinMax(
			inst.drawDate || inst.get('defaultDate') || calendar.today(), inst);
		var drawDate = inst.drawDate.newDate().add(-inst.get('monthsOffset'), 'm');
		// Generate months
		var monthRows = '';
		for (var row = 0; row < monthsToShow[0]; row++) {
			var months = '';
			for (var col = 0; col < monthsToShow[1]; col++) {
				months += this._generateMonth(target, inst, drawDate.year(),
					drawDate.month(), calendar, renderer, (row == 0 && col == 0));
				drawDate.add(1, 'm');
			}
			monthRows += this._prepare(renderer.monthRow, inst).replace(/\{months\}/, months);
		}
		/*var picker = this._prepare(renderer.picker, inst).replace(/\{months\}/, monthRows).
			replace(/\{weekHeader\}/g, this._generateDayHeaders(inst, calendar, renderer)) +
			($.browser.msie && parseInt($.browser.version, 10) < 7 && !inst.inline ?
			'<iframe src="javascript:void(0);" class="' + this._coverClass + '"></iframe>' : '');
		 */
		var picker = this._prepare(inst.options.renderer.picker, inst).replace(/\{months\}/, monthRows).
		replace(/\{weekHeader\}/g, this._generateDayHeaders(inst, inst.options.calendar, inst.options.renderer));
		// Add commands
		var commands = inst.get('commands');
		var asDateFormat = inst.get('commandsAsDateFormat');
		var addCommand = function(type, open, close, name, classes) {
			if (picker.indexOf('{' + type + ':' + name + '}') == -1) {
				return;
			}
			var command = commands[name];
			var date = (asDateFormat ? command.date.apply(target, [inst]) : null);
			picker = picker.replace(new RegExp('\\{' + type + ':' + name + '\\}', 'g'),
				'<' + open +
				(command.status ? ' title="' + inst.get(command.status) + '"' : '') +
				' class="' + renderer.commandClass + ' ' +
				renderer.commandClass + '-' + name + ' ' + classes +
				(command.enabled(inst) ? '' : ' ' + renderer.disabledClass) + '">' +
				(date ? date.formatDate(inst.get(command.text)) : inst.get(command.text)) +
				'</' + close + '>');
		};
		for (var name in commands) {
			addCommand('button', 'button type="button"', 'button', name,
				renderer.commandButtonClass);
			addCommand('link', 'a href="javascript:void(0)"', 'a', name,
				renderer.commandLinkClass);
		}
		picker = $(picker);
		if (monthsToShow[1] > 1) {
			var count = 0;
			$(renderer.monthSelector, picker).each(function() {
				var nth = ++count % monthsToShow[1];
				$(this).addClass(nth == 1 ? 'first' : (nth == 0 ? 'last' : ''));
			});
		}
		// Add calendar behaviour
		var self = this;
		picker.find(renderer.daySelector + ' a').hover(
				function() { $(this).addClass(renderer.highlightedClass); },
				function() {
					(inst.inline ? $(this).parents('.' + self.markerClass) : inst.div).
						find(renderer.daySelector + ' a').
						removeClass(renderer.highlightedClass);
				}).
			click(function() {
				self.selectDate(target, this);
			}).end().
			find('select.' + this._monthYearClass + ':not(.' + this._anyYearClass + ')').change(function() {
				var monthYear = $(this).val().split('/');
				self.showMonth(target, parseInt(monthYear[1], 10), parseInt(monthYear[0], 10));
			}).end().
			find('select.' + this._anyYearClass).click(function() {
				$(this).next('input').css({left: this.offsetLeft, top: this.offsetTop,
					width: this.offsetWidth, height: this.offsetHeight}).show().focus();
			}).end().
			find('input.' + self._monthYearClass).change(function() {
				try {
					var year = parseInt($(this).val(), 10);
					year = (isNaN(year) ? inst.drawDate.year() : year);
					self.showMonth(target, year, inst.drawDate.month(), inst.drawDate.day());
				}
				catch (e) {
					alert(e);
				}
			}).keydown(function(event) {
				if (event.keyCode == 27) { // Escape
					$(event.target).hide();
					inst.target.focus();
				}
			});
		// Add command behaviour
		picker.find('.' + renderer.commandClass).click(function() {
				if (!$(this).hasClass(renderer.disabledClass)) {
					var action = this.className.replace(
						new RegExp('^.*' + renderer.commandClass + '-([^ ]+).*$'), '$1');
					$.calendars.picker.performAction(target, action);
				}
			});
		// Add classes
		if (inst.get('isRTL')) {
			picker.addClass(renderer.rtlClass);
		}
		if (monthsToShow[0] * monthsToShow[1] > 1) {
			picker.addClass(renderer.multiClass);
		}
		var pickerClass = inst.get('pickerClass');
		if (pickerClass) {
			picker.addClass(pickerClass);
		}
		// Resize
		$('body').append(picker);
		var width = 0;
		picker.find(renderer.monthSelector).each(function() {
			width += $(this).outerWidth();
		});
		picker.width(width / monthsToShow[0]);
		// Pre-show customisation
		var onShow = inst.get('onShow');
		if (onShow) {
			onShow.apply(target, [picker, calendar, inst]);
		}
		return picker;
	},

	/* Generate the content for a single month.
	   @param  target    (element) the control to affect
	   @param  inst      (object) the current instance settings
	   @param  year      (number) the year to generate
	   @param  month     (number) the month to generate
	   @param  calendar  (*Calendar) the current calendar
	   @param  renderer  (object) the rendering templates
	   @param  first     (boolean) true if first of multiple months
	   @return  (string) the month content */
	_generateMonth: function(target, inst, year, month, calendar, renderer, first) {
		var daysInMonth = calendar.daysInMonth(year, month);
		var monthsToShow = inst.get('monthsToShow');
		monthsToShow = ($.isArray(monthsToShow) ? monthsToShow : [1, monthsToShow]);
		var fixedWeeks = inst.get('fixedWeeks') || (monthsToShow[0] * monthsToShow[1] > 1);
		var firstDay = inst.get('firstDay');
		firstDay = (firstDay == null ? calendar.local.firstDay : firstDay);
		var leadDays = (calendar.dayOfWeek(year, month, calendar.minDay) -
			firstDay + calendar.daysInWeek()) % calendar.daysInWeek();
		var numWeeks = (fixedWeeks ? 6 : Math.ceil((leadDays + daysInMonth) / calendar.daysInWeek()));
		var showOtherMonths = inst.get('showOtherMonths');
		var selectOtherMonths = inst.get('selectOtherMonths') && showOtherMonths;
		var dayStatus = inst.get('dayStatus');
		var minDate = (inst.pickingRange ? inst.selectedDates[0] : inst.get('minDate'));
		var maxDate = inst.get('maxDate');
		var rangeSelect = inst.get('rangeSelect');
		var onDate = inst.get('onDate');
		var showWeeks = renderer.week.indexOf('{weekOfYear}') > -1;
		var calculateWeek = inst.get('calculateWeek');
		var today = calendar.today();
		var drawDate = calendar.newDate(year, month, calendar.minDay);
		drawDate.add(-leadDays - (fixedWeeks &&
			(drawDate.dayOfWeek() == firstDay || drawDate.daysInMonth() < calendar.daysInWeek())?
			calendar.daysInWeek() : 0), 'd');
		var jd = drawDate.toJD();
		// Generate weeks
		var weeks = '';
		for (var week = 0; week < numWeeks; week++) {
			var weekOfYear = (!showWeeks ? '' : '<span class="jd' + jd + '">' +
				(calculateWeek ? calculateWeek(drawDate) : drawDate.weekOfYear()) + '</span>');
			var days = '';
			for (var day = 0; day < calendar.daysInWeek(); day++) {
				var selected = false;
				if (rangeSelect && inst.selectedDates.length > 0) {
					selected = (drawDate.compareTo(inst.selectedDates[0]) != -1 &&
						drawDate.compareTo(inst.selectedDates[1]) != +1)
				}
				else {
					for (var i = 0; i < inst.selectedDates.length; i++) {
						if (inst.selectedDates[i].compareTo(drawDate) == 0) {
							selected = true;
							break;
						}
					}
				}
				var dateInfo = (!onDate ? {} :
					onDate.apply(target, [drawDate, drawDate.month() == month]));
				var selectable = (selectOtherMonths || drawDate.month() == month) &&
					this._isSelectable(target, drawDate, dateInfo.selectable, minDate, maxDate);
				days += this._prepare(renderer.day, inst).replace(/\{day\}/g,
					(selectable ? '<a href="javascript:void(0)"' : '<span') +
					' class="jd' + jd + ' ' + (dateInfo.dateClass || '') +
					(selected && (selectOtherMonths || drawDate.month() == month) ?
					' ' + renderer.selectedClass : '') +
					(selectable ? ' ' + renderer.defaultClass : '') +
					(drawDate.weekDay() ? '' : ' ' + renderer.weekendClass) +
					(drawDate.month() == month ? '' : ' ' + renderer.otherMonthClass) +
					(drawDate.compareTo(today) == 0 && drawDate.month() == month ?
					' ' + renderer.todayClass : '') +
					(drawDate.compareTo(inst.drawDate) == 0 && drawDate.month() == month ?
					' ' + renderer.highlightedClass : '') + '"' +
					(dateInfo.title || (dayStatus && selectable) ? ' title="' +
					(dateInfo.title || drawDate.formatDate(dayStatus)) + '"' : '') + '>' +
					(showOtherMonths || drawDate.month() == month ?
					dateInfo.content || drawDate.day() : '&nbsp;') +
					(selectable ? '</a>' : '</span>'));
				drawDate.add(1, 'd');
				jd++;
			}
			weeks += this._prepare(renderer.week, inst).replace(/\{days\}/g, days).
				replace(/\{weekOfYear\}/g, weekOfYear);
		}
		var monthHeader = this._prepare(renderer.month, inst).match(/\{monthHeader(:[^\}]+)?\}/);
		monthHeader = (monthHeader[0].length <= 13 ? 'MM yyyy' :
			monthHeader[0].substring(13, monthHeader[0].length - 1));
		monthHeader = (first ? this._generateMonthSelection(
			inst, year, month, minDate, maxDate, monthHeader, calendar, renderer) :
			calendar.formatDate(monthHeader, calendar.newDate(year, month, calendar.minDay)));
		var weekHeader = this._prepare(renderer.weekHeader, inst).
			replace(/\{days\}/g, this._generateDayHeaders(inst, calendar, renderer));
		return this._prepare(renderer.month, inst).replace(/\{monthHeader(:[^\}]+)?\}/g, monthHeader).
			replace(/\{weekHeader\}/g, weekHeader).replace(/\{weeks\}/g, weeks);
	},

	/* Generate the HTML for the day headers.
	   @param  inst      (object) the current instance settings
	   @param  calendar  (*Calendar) the current calendar
	   @param  renderer  (object) the rendering templates
	   @return  (string) a week's worth of day headers */
	_generateDayHeaders: function(inst, calendar, renderer) {
		var firstDay = inst.get('firstDay');
		firstDay = (firstDay == null ? calendar.local.firstDay : firstDay);
		var header = '';
		for (var day = 0; day < calendar.daysInWeek(); day++) {
			var dow = (day + firstDay) % calendar.daysInWeek();
			header += this._prepare(renderer.dayHeader, inst).replace(/\{day\}/g,
				'<span class="' + this._curDoWClass + dow + '" title="' +
				calendar.local.dayNames[dow] + '"><h5>' +
				calendar.local.dayNamesMin[dow] + '</h5></span>');

		}
		return header;
	},

	/* Generate selection controls for month.
	   @param  inst         (object) the current instance settings
	   @param  year         (number) the year to generate
	   @param  month        (number) the month to generate
	   @param  minDate      (CDate) the minimum date allowed
	   @param  maxDate      (CDate) the maximum date allowed
	   @param  monthHeader  (string) the month/year format
	   @param  calendar     (*Calendar) the current calendar
	   @return  (string) the month selection content */
	_generateMonthSelection: function(inst, year, month, minDate, maxDate, monthHeader, calendar) {
		if (!inst.get('changeMonth')) {
			return calendar.formatDate(monthHeader, calendar.newDate(year, month, 1));
		}
		// Months
		var monthNames = calendar.local[
			'monthNames' + (monthHeader.match(/mm/i) ? '' : 'Short')];
		var html = monthHeader.replace(/m+/i, '\\x2E').replace(/y+/i, '\\x2F');
		/*var selector = '<select class="' + this._monthYearClass +
			'" title="' + inst.get('monthStatus') + '">';
		var maxMonth = calendar.monthsInYear(year) + calendar.minMonth;
		for (var m = calendar.minMonth; m < maxMonth; m++) {
			if ((!minDate || calendar.newDate(year, m,
					calendar.daysInMonth(year, m) - 1 + calendar.minDay).
					compareTo(minDate) != -1) &&
					(!maxDate || calendar.newDate(year, m, calendar.minDay).
					compareTo(maxDate) != +1)) {
				selector += '<option value="' + m + '/' + year + '"' +
					(month == m ? ' selected="selected"' : '') + '>' +
					monthNames[m - calendar.minMonth] + '</option>';
			}
		}
		selector += '</select>';*/
		var selector = '<div class="' + this._monthYearClass +
			'">';
		var maxMonth = calendar.monthsInYear(year) + calendar.minMonth;
		for (var m = calendar.minMonth; m < maxMonth; m++) {
			if ((!minDate || calendar.newDate(year, m,
					calendar.daysInMonth(year, m) - 1 + calendar.minDay).
					compareTo(minDate) != -1) &&
				(!maxDate || calendar.newDate(year, m, calendar.minDay).
					compareTo(maxDate) != +1)) {
				if(month == m){
				selector += '<span id="' + m + '/' + year + '"' +
					'selected="selected" ><h5>' +
					monthNames[m - calendar.minMonth] + '</h5></span>' };
			}
		}
		selector += '</div>';

		html = html.replace(/\\x2E/, selector);
		// Years
		var yearRange = inst.get('yearRange');
		if (yearRange == 'any') {
			selector = '<select class="' + this._monthYearClass + ' ' + this._anyYearClass +
				'">' +
				'<option>' + year + '</option></select>' +
				'<input class="' + this._monthYearClass + ' ' + this._curMonthClass +
				month + '" value="' + year + '">';
		}
		else {
			yearRange = yearRange.split(':');
			var todayYear = calendar.today().year();
			var start = (yearRange[0].match('c[+-].*') ? year + parseInt(yearRange[0].substring(1), 10) :
				((yearRange[0].match('[+-].*') ? todayYear : 0) + parseInt(yearRange[0], 10)));
			var end = (yearRange[1].match('c[+-].*') ? year + parseInt(yearRange[1].substring(1), 10) :
				((yearRange[1].match('[+-].*') ? todayYear : 0) + parseInt(yearRange[1], 10)));
			selector = '<div class="' + this._monthYearClass +
				'">';
			start = calendar.newDate(start + 1, calendar.firstMonth, calendar.minDay).add(-1, 'd');
			end = calendar.newDate(end, calendar.firstMonth, calendar.minDay);
			var addYear = function(y) {
				if (y != 0 || calendar.hasYearZero) {
                    if(y == year) {
						selector += '<span id="' +
							Math.min(month, calendar.monthsInYear(y) - 1 + calendar.minMonth) +
							'/' + y + '"' + (year == y ? ' selected="selected"' : '') + '><h5>' +
							y + '</h5></span>';
					}
				}
			};
			if (start.toJD() < end.toJD()) {
				start = (minDate && minDate.compareTo(start) == +1 ? minDate : start).year();
				end = (maxDate && maxDate.compareTo(end) == -1 ? maxDate : end).year();
				for (var y = start; y <= end; y++) {
					addYear(y);
				}
			}
			else {
				start = (maxDate && maxDate.compareTo(start) == -1 ? maxDate : start).year();
				end = (minDate && minDate.compareTo(end) == +1 ? minDate : end).year();
				for (var y = start; y >= end; y--) {
					addYear(y);
				}
			}
			selector += '</div>';
		}
		html = html.replace(/\\x2F/, selector);
		return html;
	},

	/* Prepare a render template for use.
	   Exclude popup/inline sections that are not applicable.
	   Localise text of the form: {l10n:name}.
	   @param  text  (string) the text to localise
	   @param  inst  (object) the current instance settings
	   @return  (string) the localised text */
	_prepare: function(text, inst) {
		var replaceSection = function(type, retain) {
			while (true) {
				var start = text.indexOf('{' + type + ':start}');
				if (start == -1) {
					return;
				}
				var end = text.substring(start).indexOf('{' + type + ':end}');
				if (end > -1) {
					text = text.substring(0, start) +
						(retain ? text.substr(start + type.length + 8, end - type.length - 8) : '') +
						text.substring(start + end + type.length + 6);
				}
			}
		};
		replaceSection('inline', inst.inline);
		replaceSection('popup', !inst.inline);
		var pattern = /\{l10n:([^\}]+)\}/;
		var matches = null;
		while (matches = pattern.exec(text)) {
			text = text.replace(matches[0], inst.get(matches[1]));
		}
		return text;
	}
});

/* jQuery extend now ignores nulls!
   @param  target  (object) the object to extend
   @param  props   (object) the new settings
   @return  (object) the updated object */
function extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props)
		if (props[name] == null || props[name] == undefined)
			target[name] = props[name];
	return target;
};

/* Attach the calendar picker functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these instances (optional)
   @return  (jQuery) for chaining further calls */
$.fn.calendarsPicker = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if ($.inArray(options, ['getDate', 'isDisabled', 'isSelectable', 'options', 'retrieveDate']) > -1) {
		return $.calendars.picker[options].apply($.calendars.picker, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			$.calendars.picker[options].apply($.calendars.picker, [this].concat(otherArgs));
		}
		else {
			$.calendars.picker._attachPicker(this, options || {});
		}
	});
};

/* Initialise the calendar picker functionality. */
$.calendars.picker = new CalendarsPicker(); // singleton instance

$(function() {
	$(document).mousedown($.calendars.picker._checkExternalClick).
		resize(function() { $.calendars.picker.hide($.calendars.picker.curInst); });
});

})(jQuery);

var process = process || {env: {NODE_ENV: "development"}};
﻿/* http://keith-wood.name/calendars.html
   Calendars date picker extensions for jQuery v1.1.4.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses.
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

var themeRollerRenderer = {
	picker: '<div{popup:start} id="ui-datepicker-div"{popup:end} class="ui-datepicker ui-calendar-widget ' +
	'ui-widget-content ui-helper-clearfix ui-corner-all{inline:start} ui-datepicker-inline{inline:end}">' +
	'{months}' +
	'{popup:start}<div class="ui-datepicker-header ui-datepicker-footer ui-widget-header ui-helper-clearfix ' +
	'ui-corner-all">{button:clear}{button:close}</div>{popup:end}' +
	'<div class="ui-helper-clearfix"></div></div>',
	monthRow: '<div class="ui-datepicker-row-break">{months}</div>',
	month: '<div class="ui-datepicker-group">' +
	'<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all">{link:prevJump}<div class="vertical-line">|</div>{link:prev}<span>{monthHeader:MM yyyy}</span>{link:next}<div class="vertical-line">|</div>{link:nextJump}{link:close}</div>' +
	'<div class="ui-datepicker-weekheader">{weekHeader}</div><table class="ui-datepicker-calendar"><tbody>{weeks}</tbody></table></div>',
	weekHeader: '<table class=""><tbody><tr>{days}</tr></tbody></table>',
	dayHeader: '<td>{day}</td>',

	week: '<tr>{days}</tr>',
	day: '<td>{day}</td>',
	monthSelector: '.ui-datepicker-group',
	daySelector: 'td',
	rtlClass: 'ui-datepicker-rtl',
	multiClass: 'ui-datepicker-multi',
	defaultClass: 'ui-state-default',
	selectedClass: 'ui-state-active',
	highlightedClass: 'ui-state-hover',
	todayClass: 'ui-state-highlight',
	otherMonthClass: 'ui-datepicker-other-month',
	weekendClass: 'ui-datepicker-week-end',
	commandClass: 'ui-datepicker-cmd',
	commandButtonClass: 'ui-state-default ui-corner-all',
	commandLinkClass: '',
	disabledClass: 'ui-datepicker-disabled'
};

$.extend($.calendars.picker, {

	// Template for generating a calendar picker showing week of year.
	weekOfYearRenderer: $.extend({}, $.calendars.picker.defaultRenderer, {
		weekHeader: '<tr><th class="calendars-week">' +
		'<span title="{l10n:weekStatus}">{l10n:weekText}</span></th>{days}</tr>',
		week: '<tr><td class="calendars-week">{weekOfYear}</td>{days}</tr>'
	}),

	// ThemeRoller template for generating a calendar picker.
	themeRollerRenderer: themeRollerRenderer,

	// ThemeRoller template for generating a calendar picker showing week of year.
	themeRollerWeekOfYearRenderer: $.extend({}, themeRollerRenderer, {
		weekHeader: '<tr><th class="ui-state-hover"><span>{l10n:weekText}</span></th>{days}</tr>',
		week: '<tr><td class="ui-state-hover">{weekOfYear}</td>{days}</tr>'
	}),

	/* Don't allow weekends to be selected.
	   Usage: onDate: $.calendars.picker.noWeekends.
	   @param  date  (CDate) the current date
	   @return  (object) information about this date */
	noWeekends: function(date) {
		return {selectable: date.weekDay()};
	},

	/* Change the first day of the week by clicking on the day header.
	   Usage: onShow: $.calendars.picker.changeFirstDay.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	changeFirstDay: function(picker, calendar, inst) {
		var target = $(this);
		picker.find('th span').each(function() {
			if (this.parentNode.className.match(/.*calendars-week.*/)) {
				return;
			}
			$('<a href="javascript:void(0)" class="' + this.className +
					'" title="Change first day of the week">' + $(this).text() + '</a>').
				click(function() {
					var dow = parseInt(this.className.replace(/^.*calendars-dow-(\d+).*$/, '$1'), 10);
					target.calendarsPicker('option', {firstDay: dow});
				}).
				replaceAll(this);
		});
	},

	/* Add a callback when hovering over dates.
	   Usage: onShow: $.calendars.picker.hoverCallback(handleHover).
	   @param  onHover  (function) the callback when hovering,
	                    it receives the current date and a flag indicating selectability
	                    as parameters on entry, and no parameters on exit,
	                    this refers to the target input or division */
	hoverCallback: function(onHover) {
		return function(picker, calendar, inst) {
			var target = this;
			var renderer = inst.get('renderer');
			picker.find(renderer.daySelector + ' a, ' + renderer.daySelector + ' span').
				hover(function() {
					onHover.apply(target, [$.calendars.picker.retrieveDate(target, this),
						this.nodeName.toLowerCase() == 'a']);
				},
				function() { onHover.apply(target, []); });
		};
	},

	/* Highlight the entire week when hovering over it.
	   Usage: onShow: $.calendars.picker.highlightWeek.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	highlightWeek: function(picker, calendar, inst) {
		var target = this;
		var renderer = inst.get('renderer');
		picker.find(renderer.daySelector + ' a, ' + renderer.daySelector + ' span').
			hover(function() {
				$(this).parents('tr').find(renderer.daySelector + ' *').
					addClass(renderer.highlightedClass);
			},
			function() {
				$(this).parents('tr').find(renderer.daySelector + ' *').
					removeClass(renderer.highlightedClass);
			});
	},

	/* Show a status bar with messages.
	   Usage: onShow: $.calendars.picker.showStatus.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	showStatus: function(picker, calendar, inst) {
		var target = this;
		var renderer = inst.get('renderer');
		var isTR = (renderer.selectedClass == 'ui-state-active');
		var defaultStatus = inst.get('defaultStatus') || '&nbsp;';
		var status = $('<div class="' + (!isTR ? 'calendars-status' :
			'ui-datepicker-status ui-widget-header ui-helper-clearfix ui-corner-all') + '">' +
			defaultStatus + '</div>').
			insertAfter(picker.find('.calendars-month-row:last,.ui-datepicker-row-break:last'));
		picker.find('*[title]').each(function() {
				var title = $(this).attr('title');
				$(this).removeAttr('title').hover(
					function() { status.text(title || defaultStatus); },
					function() { status.text(defaultStatus); });
			});
	},

	/* Allow easier navigation by month.
	   Usage: onShow: $.calendars.picker.monthNavigation.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	monthNavigation: function(picker, calendar, inst) {
		var target = $(this);
		var renderer = inst.get('renderer');
		var isTR = (renderer.selectedClass == 'ui-state-active');
		var minDate = inst.curMinDate();
		var maxDate = inst.get('maxDate');
		var monthNames = calendar.local.monthNames;
		var monthNamesShort = calendar.local.monthNamesShort;
		var year = inst.drawDate.year();
		var html = '<div class="' + (!isTR ? 'calendars-month-nav' : 'ui-datepicker-month-nav') + '">';
		for (var i = 0; i < calendar.monthsInYear(year); i++) {
			var ord = calendar.fromMonthOfYear(year, i + calendar.minMonth) - calendar.minMonth;
			var inRange = ((!minDate || calendar.newDate(year, i + calendar.minMonth,
				calendar.daysInMonth(year, i + calendar.minMonth)).compareTo(minDate) > -1) && (!maxDate ||
				calendar.newDate(year, i + calendar.minMonth, calendar.minDay).compareTo(maxDate) < +1));
			html += '<div>' + (inRange ? '<a href="#" class="jd' +
				calendar.newDate(year, i + calendar.minMonth, calendar.minDay).toJD() + '"' : '<span') +
				' title="' + monthNames[ord] + '">' + monthNamesShort[ord] +
				(inRange ? '</a>' : '</span>') + '</div>';
		}
		html += '</div>';
		$(html).insertAfter(picker.find('div.calendars-nav,div.ui-datepicker-header:first')).
			find('a').click(function() {
				var date = $.calendars.picker.retrieveDate(target[0], this);
				target.calendarsPicker('showMonth', date.year(), date.month());
				return false;
			});
	},

	/* Select an entire week when clicking on a week number.
	   Use in conjunction with weekOfYearRenderer.
	   Usage: onShow: $.calendars.picker.selectWeek.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	selectWeek: function(picker, calendar, inst) {
		var target = $(this);
		picker.find('td.calendars-week span').each(function() {
			$('<a href="javascript:void(0)" class="' +
					this.className + '" title="Select the entire week">' +
					$(this).text() + '</a>').
				click(function() {
					var date = target.calendarsPicker('retrieveDate', this);
					var dates = [date];
					for (var i = 1; i < calendar.daysInWeek(); i++) {
						dates.push(date = date.newDate().add(1, 'd'));
					}
					if (inst.get('rangeSelect')) {
						dates.splice(1, dates.length - 2);
					}
					target.calendarsPicker('setDate', dates).calendarsPicker('hide');
				}).
				replaceAll(this);
		});
	},

	/* Select an entire month when clicking on the week header.
	   Use in conjunction with weekOfYearRenderer.
	   Usage: onShow: $.calendars.picker.selectMonth.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	selectMonth: function(picker, calendar, inst) {
		var target = $(this);
		picker.find('th.calendars-week').each(function() {
			$('<a href="javascript:void(0)" title="Select the entire month">' +
					$(this).text() + '</a>').
				click(function() {
					var date = target.calendarsPicker('retrieveDate', $(this).parents('table').
						find('td:not(.calendars-week) *:not(.calendars-other-month)')[0]);
					var dates = [date.day(1)];
					var dim = calendar.daysInMonth(date);
					for (var i = 1; i < dim; i++) {
						dates.push(date = date.newDate().add(1, 'd'));
					}
					if (inst.get('rangeSelect')) {
						dates.splice(1, dates.length - 2);
					}
					target.calendarsPicker('setDate', dates).calendarsPicker('hide');
				}).
				appendTo(this);
		});
	},

	/* Select a month only instead of a single day.
	   Usage: onShow: $.calendars.picker.monthOnly.
	   @param  picker    (jQuery) the completed datepicker division
	   @param  calendar  (*Calendar) the calendar implementation
	   @param  inst      (object) the current instance settings */
	monthOnly: function(picker, calendar, inst) {
		var target = $(this);
		var selectMonth = $('<div style="text-align: center;"><button type="button">Select</button></div>').
			insertAfter(picker.find('.calendars-month-row:last,.ui-datepicker-row-break:last')).
			children().click(function() {
				var monthYear = picker.find('.calendars-month-year:first').val().split('/');
				target.calendarsPicker('setDate', calendar.newDate(
					parseInt(monthYear[1], 10), parseInt(monthYear[0], 10), calendar.minDay)).
					calendarsPicker('hide');
			});
		picker.find('.calendars-month-row table,.ui-datepicker-row-break table').remove();
	}
});

})(jQuery);

var process = process || {env: {NODE_ENV: "development"}};
﻿/* http://keith-wood.name/calendars.html
   Islamic calendar for jQuery v1.1.4.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* Implementation of the Islamic or '16 civil' calendar.
   Based on code from http://www.iranchamber.com/calendar/converter/iranian_calendar_converter.php.
   See also http://en.wikipedia.org/wiki/Islamic_calendar.
   @param  language  (string) the language code (default English) for localisation (optional) */
function IslamicCalendar(language) {
	this.local = this.regional[language || ''] || this.regional[''];
}

IslamicCalendar.prototype = new $.calendars.baseCalendar;

$.extend(IslamicCalendar.prototype, {
	name: 'Islamic', // The calendar name
	jdEpoch: 1948439.5, // Julian date of start of Islamic epoch: 16 July 622 CE
	daysPerMonth: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], // Days per month in a common year
	hasYearZero: false, // True if has a year zero, false if not
	minMonth: 1, // The minimum month number
	firstMonth: 1, // The first month in the year
	minDay: 1, // The minimum day number

	regional: { // Localisations
		'': {
			name: 'Islamic', // The calendar name
			epochs: ['BH', 'AH'],
			monthNames: ['Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani', 'Jumada al-awwal', 'Jumada al-thani',
			'Rajab', 'Sha\'aban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'],
			monthNamesShort: ['Muh', 'Saf', 'Rab1', 'Rab2', 'Jum1', 'Jum2', 'Raj', 'Sha\'', 'Ram', 'Shaw', 'DhuQ', 'DhuH'],
			dayNames: ['Yawm al-ahad', 'Yawm al-ithnayn', 'Yawm ath-thulaathaa\'',
			'Yawm al-arbi\'aa\'', 'Yawm al-khamīs', 'Yawm al-jum\'a', 'Yawm as-sabt'],
			dayNamesShort: ['Aha', 'Ith', 'Thu', 'Arb', 'Kha', 'Jum', 'Sab'],
			dayNamesMin: ['Ah','It','Th','Ar','Kh','Ju','Sa'],
			dateFormat: 'yyyy/mm/dd', // See format options on BaseCalendar.formatDate
			firstDay: 6, // The first day of the week, Sun = 0, Mon = 1, ...
			isRTL: false // True if right-to-left language, false if left-to-right
		}
	},

	/* Determine whether this date is in a leap year.
	   @param  year  (CDate) the date to examine or
	                 (number) the year to examine
	   @return  (boolean) true if this is a leap year, false if not
	   @throws  error if an invalid year or a different calendar used */
	leapYear: function(year) {
		var date = this._validate(year, this.minMonth, this.minDay, $.calendars.local.invalidYear);
		return (date.year() * 11 + 14) % 30 < 11;
	},

	/* Determine the week of the year for a date.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (number) the week of the year
	   @throws  error if an invalid date or a different calendar used */
	weekOfYear: function(year, month, day) {
		// Find Sunday of this week starting on Sunday
		var checkDate = this.newDate(year, month, day);
		checkDate.add(-checkDate.dayOfWeek(), 'd');
		return Math.floor((checkDate.dayOfYear() - 1) / 7) + 1;
	},

	/* Retrieve the number of days in a year.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @return  (number) the number of days
	   @throws  error if an invalid year or a different calendar used */
	daysInYear: function(year) {
		return (this.leapYear(year) ? 355 : 354);
	},

	/* Retrieve the number of days in a month.
	   @param  year   (CDate) the date to examine or
	                  (number) the year of the month
	   @param  month  (number) the month
	   @return  (number) the number of days in this month
	   @throws  error if an invalid month/year or a different calendar used */
	daysInMonth: function(year, month) {
		var date = this._validate(year, month, this.minDay, $.calendars.local.invalidMonth);
		return this.daysPerMonth[date.month() - 1] +
			(date.month() == 12 && this.leapYear(date.year()) ? 1 : 0);
	},

	/* Determine whether this date is a week day.
	   @param  year   (CDate) the date to examine or
	                  (number) the year to examine
	   @param  month  (number) the month to examine
	   @param  day    (number) the day to examine
	   @return  (boolean) true if a week day, false if not
	   @throws  error if an invalid date or a different calendar used */
	weekDay: function(year, month, day) {
		return this.dayOfWeek(year, month, day) != 5;
	},

	/* Retrieve the Julian date equivalent for this date,
	   i.e. days since January 1, 4713 BCE Greenwich noon.
	   @param  year   (CDate) the date to convert or
	                  (number) the year to convert
	   @param  month  (number) the month to convert
	   @param  day    (number) the day to convert
	   @return  (number) the equivalent Julian date
	   @throws  error if an invalid date or a different calendar used */
	toJD: function(year, month, day) {
		var date = this._validate(year, month, day, $.calendars.local.invalidDate);
		year = date.year();
		month = date.month();
		day = date.day();
		year = (year <= 0 ? year + 1 : year);
		return day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 +
			Math.floor((3 + (11 * year)) / 30) + this.jdEpoch - 1;
	},

	/* Create a new date from a Julian date.
	   @param  jd  (number) the Julian date to convert
	   @return  (CDate) the equivalent date */
	fromJD: function(jd) {
		jd = Math.floor(jd) + 0.5;
		var year = Math.floor((30 * (jd - this.jdEpoch) + 10646) / 10631);
		year = (year <= 0 ? year - 1 : year);
		var month = Math.min(12, Math.ceil((jd - 29 - this.toJD(year, 1, 1)) / 29.5) + 1);
		var day = jd - this.toJD(year, month, 1) + 1;
		return this.newDate(year, month, day);
	}
});

// Islamic (16 civil) calendar implementation
$.calendars.calendars.islamic = IslamicCalendar;

})(jQuery);
var process = process || {env: {NODE_ENV: "development"}};
/* http://keith-wood.name/timeEntry.html
   Time entry for jQuery v1.5.1.
   Written by Keith Wood (kbwood{at}iinet.com.au) June 2007.
   Licensed under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license.
   Please attribute the author if you use it. */

/* Turn an input field into an entry point for a time value.
   The time can be entered via directly typing the value,
   via the arrow keys, or via spinner buttons.
   It is configurable to show 12 or 24-hour time, to show or hide seconds,
   to enforce a minimum and/or maximum time, to change the spinner image,
   and to constrain the time to steps, e.g. only on the quarter hours.
   Attach it with $('input selector').timeEntry(); for default settings,
   or configure it with options like:
   $('input selector').timeEntry(
      {spinnerImage: 'spinnerSquare.png', spinnerSize: [20, 20, 0]}); */

(function($) { // Hide scope, no $ conflict

/* TimeEntry manager.
   Use the singleton instance of this class, $.timeEntry, to interact with the time entry
   functionality. Settings for (groups of) fields are maintained in an instance object,
   allowing multiple different settings on the same page. */
function TimeEntry() {
	this._disabledInputs = []; // List of time entry inputs that have been disabled
	this.regional = []; // Available regional settings, indexed by language code
	this.regional[''] = { // Default regional settings
		show24Hours: false, // True to use 24 hour time, false for 12 hour (AM/PM)
		separator: ':', // The separator between time fields
		ampmPrefix: '', // The separator before the AM/PM text
		ampmNames: ['AM', 'PM'], // Names of morning/evening markers
		spinnerTexts: ['Now', 'Previous field', 'Next field', 'Increment', 'Decrement']
		// The popup texts for the spinner image areas
	};
	this._defaults = {
		appendText: '', // Display text following the input box, e.g. showing the format
		showSeconds: false, // True to show seconds as well, false for hours/minutes only
		timeSteps: [1, 1, 1], // Steps for each of hours/minutes/seconds when incrementing/decrementing
		initialField: 0, // The field to highlight initially, 0 = hours, 1 = minutes, ...
		noSeparatorEntry: false, // True to move to next sub-field after two digits entry
		useMouseWheel: true, // True to use mouse wheel for increment/decrement if possible,
			// false to never use it
		defaultTime: null, // The time to use if none has been set, leave at null for now
		minTime: null, // The earliest selectable time, or null for no limit
		maxTime: null, // The latest selectable time, or null for no limit
		spinnerImage: 'spinnerDefault.png', // The URL of the images to use for the time spinner
			// Seven images packed horizontally for normal, each button pressed, and disabled
		spinnerSize: [20, 20, 8], // The width and height of the spinner image,
			// and size of centre button for current time
		spinnerBigImage: '', // The URL of the images to use for the expanded time spinner
			// Seven images packed horizontally for normal, each button pressed, and disabled
		spinnerBigSize: [40, 40, 16], // The width and height of the expanded spinner image,
			// and size of centre button for current time
		spinnerIncDecOnly: false, // True for increment/decrement buttons only, false for all
		spinnerRepeat: [500, 250], // Initial and subsequent waits in milliseconds
			// for repeats on the spinner buttons
		beforeShow: null, // Function that takes an input field and
			// returns a set of custom settings for the time entry
		beforeSetTime: null // Function that runs before updating the time,
			// takes the old and new times, and minimum and maximum times as parameters,
			// and returns an adjusted time if necessary
	};
	$.extend(this._defaults, this.regional['']);
}

$.extend(TimeEntry.prototype, {
	/* Class name added to elements to indicate already configured with time entry. */
	markerClassName: 'hasTimeEntry',
	/* Name of the data property for instance settings. */
	propertyName: 'timeEntry',

	/* Class name for the appended content. */
	_appendClass: 'timeEntry_append',
	/* Class name for the time entry control. */
	_controlClass: 'timeEntry_control',
	/* Class name for the expanded spinner. */
	_expandClass: 'timeEntry_expand',

	/* Override the default settings for all instances of the time entry.
	   @param  options  (object) the new settings to use as defaults (anonymous object)
	   @return  (DateEntry) this object */
	setDefaults: function(options) {
		$.extend(this._defaults, options || {});
		return this;
	},

	/* Attach the time entry handler to an input field.
	   @param  target   (element) the field to attach to
	   @param  options  (object) custom settings for this instance */
	_attachPlugin: function(target, options) {
		var input = $(target);
		if (input.hasClass(this.markerClassName)) {
			return;
		}
		var inst = {options: $.extend({}, this._defaults, options), input: input, _field: 0,
			_selectedHour: 0, _selectedMinute: 0, _selectedSecond: 0};
		input.data(this.propertyName, inst).addClass(this.markerClassName).
			bind('focus.' + this.propertyName, this._doFocus).
			bind('blur.' + this.propertyName, this._doBlur).
			bind('click.' + this.propertyName, this._doClick).
			bind('keydown.' + this.propertyName, this._doKeyDown).
			bind('keypress.' + this.propertyName, this._doKeyPress).
			bind('paste.' + this.propertyName, function(event) { // Check pastes
				setTimeout(function() { plugin._parseTime(inst); }, 1);
			});
		this._optionPlugin(target, options);
	},

	/* Retrieve or reconfigure the settings for a time entry control.
	   @param  target   (element) the control to affect
	   @param  options  (object) the new options for this instance or
	                    (string) an individual property name
	   @param  value    (any) the individual property value (omit if options
	                    is an object or to retrieve the value of a setting)
	   @return  (any) if retrieving a value  */
	_optionPlugin: function(target, options, value) {
		target = $(target);
		var inst = target.data(this.propertyName);
		if (!options || (typeof options == 'string' && value == null)) { // Get option
			var name = options;
			options = (inst || {}).options;
			return (options && name ? options[name] : options);
		}

		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		options = options || {};
		if (typeof options == 'string') {
			var name = options;
			options = {};
			options[name] = value;
		}
		var currentTime = this._extractTime(inst);
		$.extend(inst.options, options);
		inst._field = 0;
		if (currentTime) {
			this._setTime(inst, new Date(0, 0, 0, currentTime[0], currentTime[1], currentTime[2]));
		}
		// Remove stuff dependent on old settings
		target.next('span.' + this._appendClass).remove();
		target.parent().find('span.' + this._controlClass).remove();
		if ($.fn.mousewheel) {
			target.unmousewheel();
		}
		// And re-add if requested
		var spinner = (!inst.options.spinnerImage ? null :
			$('<span class="' + this._controlClass + '" style="display: inline-block; ' +
			'background: url(\'' + inst.options.spinnerImage + '\') 0 0 no-repeat; width: ' +
			inst.options.spinnerSize[0] + 'px; height: ' + inst.options.spinnerSize[1] + 'px;"></span>'));
		target.after(inst.options.appendText ? '<span class="' + this._appendClass + '">' +
			inst.options.appendText + '</span>' : '').after(spinner || '');
		// Allow mouse wheel usage
		if (inst.options.useMouseWheel && $.fn.mousewheel) {
			target.mousewheel(this._doMouseWheel);
		}
		if (spinner) {
			spinner.mousedown(this._handleSpinner).mouseup(this._endSpinner).
				mouseover(this._expandSpinner).mouseout(this._endSpinner).
				mousemove(this._describeSpinner);
		}
	},

	/* Enable a time entry input and any associated spinner.
	   @param  target  (element) single input field */
	_enablePlugin: function(target) {
		this._enableDisable(target, false);
	},

	/* Disable a time entry input and any associated spinner.
	   @param  target  (element) single input field */
	_disablePlugin: function(target) {
		this._enableDisable(target, true);
	},

	/* Enable or disable a time entry input and any associated spinner.
	   @param  target   (element) single input field
	   @param  disable  (boolean) true to disable, false to enable */
	_enableDisable: function(target, disable) {
		var inst = $.data(target, this.propertyName);
		if (!inst) {
			return;
		}
		target.disabled = disable;
		if (target.nextSibling && target.nextSibling.nodeName.toLowerCase() == 'span') {
			plugin._changeSpinner(inst, target.nextSibling, (disable ? 5 : -1));
		}
		plugin._disabledInputs = $.map(plugin._disabledInputs,
			function(value) { return (value == target ? null : value); }); // Delete entry
		if (disable) {
			plugin._disabledInputs.push(target);
		}
	},

	/* Check whether an input field has been disabled.
	   @param  target  (element) input field to check
	   @return  (boolean) true if this field has been disabled, false if it is enabled */
	_isDisabledPlugin: function(target) {
		return $.inArray(target, this._disabledInputs) > -1;
	},

	/* Remove the time entry functionality from an input.
	   @param  target  (element) the control to affect */
	_destroyPlugin: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).removeData(this.propertyName).
			unbind('.' + this.propertyName);
		if ($.fn.mousewheel) {
			target.unmousewheel();
		}
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value == target[0] ? null : value); }); // Delete entry
		target.siblings('.' + this._appendClass + ',.' + this._controlClass).remove();
	},

	/* Initialise the current time for a time entry input field.
	   @param  target  (element) input field to update
	   @param  time    (Date) the new time (year/month/day ignored) or null for now */
	_setTimePlugin: function(target, time) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			if (time === null || time === '') {
				inst.input.val('');
			}
			else {
				this._setTime(inst, time ? (typeof time == 'object' ?
					new Date(time.getTime()) : time) : null);
			}
		}
	},

	/* Retrieve the current time for a time entry input field.
	   @param  target  (element) input field to examine
	   @return  (Date) current time (year/month/day zero) or null if none */
	_getTimePlugin: function(target) {
		var inst = $.data(target, this.propertyName);
		var currentTime = (inst ? this._extractTime(inst) : null);
		return (!currentTime ? null :
			new Date(0, 0, 0, currentTime[0], currentTime[1], currentTime[2]));
	},

	/* Retrieve the millisecond offset for the current time.
	   @param  target  (element) input field to examine
	   @return  (number) the time as milliseconds offset or zero if none */
	_getOffsetPlugin: function(target) {
		var inst = $.data(target, this.propertyName);
		var currentTime = (inst ? this._extractTime(inst) : null);
		return (!currentTime ? 0 :
			(currentTime[0] * 3600 + currentTime[1] * 60 + currentTime[2]) * 1000);
	},

	/* Initialise time entry.
	   @param  target  (element) the input field or
	                   (event) the focus event */
	_doFocus: function(target) {
		var input = (target.nodeName && target.nodeName.toLowerCase() == 'input' ? target : this);
		if (plugin._lastInput == input || plugin._isDisabledPlugin(input)) {
			plugin._focussed = false;
			return;
		}
		var inst = $.data(input, plugin.propertyName);
		plugin._focussed = true;
		plugin._lastInput = input;
		plugin._blurredInput = null;
		$.extend(inst.options, ($.isFunction(inst.options.beforeShow) ?
			inst.options.beforeShow.apply(input, [input]) : {}));
		plugin._parseTime(inst);
		setTimeout(function() { plugin._showField(inst); }, 10);
	},

	/* Note that the field has been exited.
	   @param  event  (event) the blur event */
	_doBlur: function(event) {
		plugin._blurredInput = plugin._lastInput;
		plugin._lastInput = null;
	},

	/* Select appropriate field portion on click, if already in the field.
	   @param  event  (event) the click event */
	_doClick: function(event) {
		var input = event.target;
		var inst = $.data(input, plugin.propertyName);
		if (!plugin._focussed) {
			var fieldSize = inst.options.separator.length + 2;
			inst._field = 0;
			if (input.selectionStart != null) { // Use input select range
				for (var field = 0; field <= Math.max(1, inst._secondField, inst._ampmField); field++) {
					var end = (field != inst._ampmField ? (field * fieldSize) + 2 :
						(inst._ampmField * fieldSize) + inst.options.ampmPrefix.length +
						inst.options.ampmNames[0].length);
					inst._field = field;
					if (input.selectionStart < end) {
						break;
					}
				}
			}
			else if (input.createTextRange) { // Check against bounding boxes
				var src = $(event.srcElement);
				var range = input.createTextRange();
				var convert = function(value) {
					return {thin: 2, medium: 4, thick: 6}[value] || value;
				};
				var offsetX = event.clientX + document.documentElement.scrollLeft -
					(src.offset().left + parseInt(convert(src.css('border-left-width')), 10)) -
					range.offsetLeft; // Position - left edge - alignment
				for (var field = 0; field <= Math.max(1, inst._secondField, inst._ampmField); field++) {
					var end = (field != inst._ampmField ? (field * fieldSize) + 2 :
						(inst._ampmField * fieldSize) + inst.options.ampmPrefix.length +
						inst.options.ampmNames[0].length);
					range.collapse();
					range.moveEnd('character', end);
					inst._field = field;
					if (offsetX < range.boundingWidth) { // And compare
						break;
					}
				}
			}
		}
		plugin._showField(inst);
		plugin._focussed = false;
	},

	/* Handle keystrokes in the field.
	   @param  event  (event) the keydown event
	   @return  (boolean) true to continue, false to stop processing */
	_doKeyDown: function(event) {
		if (event.keyCode >= 48) { // >= '0'
			return true;
		}
		var inst = $.data(event.target, plugin.propertyName);
		switch (event.keyCode) {
			case 9: return (event.shiftKey ?
						// Move to previous time field, or out if at the beginning
						plugin._changeField(inst, -1, true) :
						// Move to next time field, or out if at the end
						plugin._changeField(inst, +1, true));
			case 35: if (event.ctrlKey) { // Clear time on ctrl+end
						plugin._setValue(inst, '');
					}
					else { // Last field on end
						inst._field = Math.max(1, inst._secondField, inst._ampmField);
						plugin._adjustField(inst, 0);
					}
					break;
			case 36: if (event.ctrlKey) { // Current time on ctrl+home
						plugin._setTime(inst);
					}
					else { // First field on home
						inst._field = 0;
						plugin._adjustField(inst, 0);
					}
					break;
			case 37: plugin._changeField(inst, -1, false); break; // Previous field on left
			case 38: plugin._adjustField(inst, +1); break; // Increment time field on up
			case 39: plugin._changeField(inst, +1, false); break; // Next field on right
			case 40: plugin._adjustField(inst, -1); break; // Decrement time field on down
			case 46: plugin._setValue(inst, ''); break; // Clear time on delete
			default: return true;
		}
		return false;
	},

	/* Disallow unwanted characters.
	   @param  event  (event) the keypress event
	   @return  (boolean) true to continue, false to stop processing */
	_doKeyPress: function(event) {
		var chr = String.fromCharCode(event.charCode == undefined ? event.keyCode : event.charCode);
		if (chr < ' ') {
			return true;
		}
		var inst = $.data(event.target, plugin.propertyName);
		plugin._handleKeyPress(inst, chr);
		return false;
	},

	/* Increment/decrement on mouse wheel activity.
	   @param  event  (event) the mouse wheel event
	   @param  delta  (number) the amount of change */
	_doMouseWheel: function(event, delta) {
		if (plugin._isDisabledPlugin(event.target)) {
			return;
		}
		var inst = $.data(event.target, plugin.propertyName);
		inst.input.focus();
		if (!inst.input.val()) {
			plugin._parseTime(inst);
		}
		plugin._adjustField(inst, delta);
		event.preventDefault();
	},

	/* Expand the spinner, if possible, to make it easier to use.
	   @param  event  (event) the mouse over event */
	_expandSpinner: function(event) {
		var spinner = plugin._getSpinnerTarget(event);
		var inst = $.data(plugin._getInput(spinner), plugin.propertyName);
		if (plugin._isDisabledPlugin(inst.input[0])) {
			return;
		}
		if (inst.options.spinnerBigImage) {
			inst._expanded = true;
			var offset = $(spinner).offset();
			var relative = null;
			$(spinner).parents().each(function() {
				var parent = $(this);
				if (parent.css('position') == 'relative' ||
						parent.css('position') == 'absolute') {
					relative = parent.offset();
				}
				return !relative;
			});
			$('<div class="' + plugin._expandClass + '" style="position: absolute; left: ' +
				(offset.left - (inst.options.spinnerBigSize[0] - inst.options.spinnerSize[0]) / 2 -
				(relative ? relative.left : 0)) + 'px; top: ' +
				(offset.top - (inst.options.spinnerBigSize[1] - inst.options.spinnerSize[1]) / 2 -
				(relative ? relative.top : 0)) + 'px; width: ' +
				inst.options.spinnerBigSize[0] + 'px; height: ' +
				inst.options.spinnerBigSize[1] + 'px; background: transparent url(' +
				inst.options.spinnerBigImage + ') no-repeat 0px 0px; z-index: 10;"></div>').
				mousedown(plugin._handleSpinner).mouseup(plugin._endSpinner).
				mouseout(plugin._endExpand).mousemove(plugin._describeSpinner).
				insertAfter(spinner);
		}
	},

	/* Locate the actual input field from the spinner.
	   @param  spinner  (element) the current spinner
	   @return  (element) the corresponding input */
	_getInput: function(spinner) {
		return $(spinner).siblings('.' + plugin.markerClassName)[0];
	},

	/* Change the title based on position within the spinner.
	   @param  event  (event) the mouse move event */
	_describeSpinner: function(event) {
		var spinner = plugin._getSpinnerTarget(event);
		var inst = $.data(plugin._getInput(spinner), plugin.propertyName);
		spinner.title = inst.options.spinnerTexts[plugin._getSpinnerRegion(inst, event)];
	},

	/* Handle a click on the spinner.
	   @param  event  (event) the mouse click event */
	_handleSpinner: function(event) {
		var spinner = plugin._getSpinnerTarget(event);
		var input = plugin._getInput(spinner);
		if (plugin._isDisabledPlugin(input)) {
			return;
		}
		if (input == plugin._blurredInput) {
			plugin._lastInput = input;
			plugin._blurredInput = null;
		}
		var inst = $.data(input, plugin.propertyName);
		plugin._doFocus(input);
		var region = plugin._getSpinnerRegion(inst, event);
		plugin._changeSpinner(inst, spinner, region);
		plugin._actionSpinner(inst, region);
		plugin._timer = null;
		plugin._handlingSpinner = true;
		if (region >= 3 && inst.options.spinnerRepeat[0]) { // Repeat increment/decrement
			plugin._timer = setTimeout(
				function() { plugin._repeatSpinner(inst, region); },
				inst.options.spinnerRepeat[0]);
			$(spinner).one('mouseout', plugin._releaseSpinner).
				one('mouseup', plugin._releaseSpinner);
		}
	},

	/* Action a click on the spinner.
	   @param  inst    (object) the instance settings
	   @param  region  (number) the spinner "button" */
	_actionSpinner: function(inst, region) {
		if (!inst.input.val()) {
			plugin._parseTime(inst);
		}
		switch (region) {
			case 0: this._setTime(inst); break;
			case 1: this._changeField(inst, -1, false); break;
			case 2: this._changeField(inst, +1, false); break;
			case 3: this._adjustField(inst, +1); break;
			case 4: this._adjustField(inst, -1); break;
		}
	},

	/* Repeat a click on the spinner.
	   @param  inst    (object) the instance settings
	   @param  region  (number) the spinner "button" */
	_repeatSpinner: function(inst, region) {
		if (!plugin._timer) {
			return;
		}
		plugin._lastInput = plugin._blurredInput;
		this._actionSpinner(inst, region);
		this._timer = setTimeout(
			function() { plugin._repeatSpinner(inst, region); },
			inst.options.spinnerRepeat[1]);
	},

	/* Stop a spinner repeat.
	   @param  event  (event) the mouse event */
	_releaseSpinner: function(event) {
		clearTimeout(plugin._timer);
		plugin._timer = null;
	},

	/* Tidy up after an expanded spinner.
	   @param  event  (event) the mouse event */
	_endExpand: function(event) {
		plugin._timer = null;
		var spinner = plugin._getSpinnerTarget(event);
		var input = plugin._getInput(spinner);
		var inst = $.data(input, plugin.propertyName);
		$(spinner).remove();
		inst._expanded = false;
	},

	/* Tidy up after a spinner click.
	   @param  event  (event) the mouse event */
	_endSpinner: function(event) {
		plugin._timer = null;
		var spinner = plugin._getSpinnerTarget(event);
		var input = plugin._getInput(spinner);
		var inst = $.data(input, plugin.propertyName);
		if (!plugin._isDisabledPlugin(input)) {
			plugin._changeSpinner(inst, spinner, -1);
		}
		if (plugin._handlingSpinner) {
			plugin._lastInput = plugin._blurredInput;
		}
		if (plugin._lastInput && plugin._handlingSpinner) {
			plugin._showField(inst);
		}
		plugin._handlingSpinner = false;
	},

	/* Retrieve the spinner from the event.
	   @param  event  (event) the mouse click event
	   @return  (element) the target field */
	_getSpinnerTarget: function(event) {
		return event.target || event.srcElement;
	},

	/* Determine which "button" within the spinner was clicked.
	   @param  inst   (object) the instance settings
	   @param  event  (event) the mouse event
	   @return  (number) the spinner "button" number */
	_getSpinnerRegion: function(inst, event) {
		var spinner = this._getSpinnerTarget(event);
		var pos = $(spinner).offset();
		var scrolled = [document.documentElement.scrollLeft || document.body.scrollLeft,
			document.documentElement.scrollTop || document.body.scrollTop];
		var left = (inst.options.spinnerIncDecOnly ? 99 : event.clientX + scrolled[0] - pos.left);
		var top = event.clientY + scrolled[1] - pos.top;
		var spinnerSize = inst.options[inst._expanded ? 'spinnerBigSize' : 'spinnerSize'];
		var right = (inst.options.spinnerIncDecOnly ? 99 : spinnerSize[0] - 1 - left);
		var bottom = spinnerSize[1] - 1 - top;
		if (spinnerSize[2] > 0 && Math.abs(left - right) <= spinnerSize[2] &&
				Math.abs(top - bottom) <= spinnerSize[2]) {
			return 0; // Centre button
		}
		var min = Math.min(left, top, right, bottom);
		return (min == left ? 1 : (min == right ? 2 : (min == top ? 3 : 4))); // Nearest edge
	},

	/* Change the spinner image depending on button clicked.
	   @param  inst     (object) the instance settings
	   @param  spinner  (element) the spinner control
	   @param  region   (number) the spinner "button" */
	_changeSpinner: function(inst, spinner, region) {
		$(spinner).css('background-position', '-' + ((region + 1) *
			inst.options[inst._expanded ? 'spinnerBigSize' : 'spinnerSize'][0]) + 'px 0px');
	},

	/* Extract the time value from the input field, or default to now.
	   @param  inst  (object) the instance settings */
	_parseTime: function(inst) {
		var currentTime = this._extractTime(inst);
		if (currentTime) {
			inst._selectedHour = currentTime[0];
			inst._selectedMinute = currentTime[1];
			inst._selectedSecond = currentTime[2];
		}
		else {
			var now = this._constrainTime(inst);
			inst._selectedHour = now[0];
			inst._selectedMinute = now[1];
			inst._selectedSecond = (inst.options.showSeconds ? now[2] : 0);
		}
		inst._secondField = (inst.options.showSeconds ? 2 : -1);
		inst._ampmField = (inst.options.show24Hours ? -1 : (inst.options.showSeconds ? 3 : 2));
		inst._lastChr = '';
		inst._field = Math.max(0, Math.min(
			Math.max(1, inst._secondField, inst._ampmField), inst.options.initialField));
		if (inst.input.val() != '') {
			this._showTime(inst);
		}
	},

	/* Extract the time value from a string as an array of values, or default to null.
	   @param  inst   (object) the instance settings
	   @param  value  (string) the time value to parse
	   @return  (number[3]) the time components (hours, minutes, seconds)
	            or null if no value */
	_extractTime: function(inst, value) {
		value = value || inst.input.val();
		var currentTime = value.split(inst.options.separator);
		if (inst.options.separator == '' && value != '') {
			currentTime[0] = value.substring(0, 2);
			currentTime[1] = value.substring(2, 4);
			currentTime[2] = value.substring(4, 6);
		}
		if (currentTime.length >= 2) {
			var isAM = !inst.options.show24Hours && (value.indexOf(inst.options.ampmNames[0]) > -1);
			var isPM = !inst.options.show24Hours && (value.indexOf(inst.options.ampmNames[1]) > -1);
			var hour = parseInt(currentTime[0], 10);
			hour = (isNaN(hour) ? 0 : hour);
			hour = ((isAM || isPM) && hour == 12 ? 0 : hour) + (isPM ? 12 : 0);
			var minute = parseInt(currentTime[1], 10);
			minute = (isNaN(minute) ? 0 : minute);
			var second = (currentTime.length >= 3 ?
				parseInt(currentTime[2], 10) : 0);
			second = (isNaN(second) || !inst.options.showSeconds ? 0 : second);
			return this._constrainTime(inst, [hour, minute, second]);
		} 
		return null;
	},

	/* Constrain the given/current time to the time steps.
	   @param  inst    (object) the instance settings
	   @param  fields  (number[3]) the current time components (hours, minutes, seconds)
	   @return  (number[3]) the constrained time components (hours, minutes, seconds) */
	_constrainTime: function(inst, fields) {
		var specified = (fields != null);
		if (!specified) {
			var now = this._determineTime(inst.options.defaultTime, inst) || new Date();
			fields = [now.getHours(), now.getMinutes(), now.getSeconds()];
		}
		var reset = false;
		for (var i = 0; i < inst.options.timeSteps.length; i++) {
			if (reset) {
				fields[i] = 0;
			}
			else if (inst.options.timeSteps[i] > 1) {
				fields[i] = Math.round(fields[i] / inst.options.timeSteps[i]) *
					inst.options.timeSteps[i];
				reset = true;
			}
		}
		return fields;
	},

	/* Set the selected time into the input field.
	   @param  inst  (object) the instance settings */
	_showTime: function(inst) {
		var currentTime = (this._formatNumber(inst.options.show24Hours ? inst._selectedHour :
			((inst._selectedHour + 11) % 12) + 1) + inst.options.separator +
			this._formatNumber(inst._selectedMinute) +
			(inst.options.showSeconds ? inst.options.separator +
			this._formatNumber(inst._selectedSecond) : '') +
			(inst.options.show24Hours ?  '' : inst.options.ampmPrefix +
			inst.options.ampmNames[(inst._selectedHour < 12 ? 0 : 1)]));
		this._setValue(inst, currentTime);
		this._showField(inst);
	},

	/* Highlight the current time field.
	   @param  inst  (object) the instance settings */
	_showField: function(inst) {
		var input = inst.input[0];
		if (inst.input.is(':hidden') || plugin._lastInput != input) {
			return;
		}
		var fieldSize = inst.options.separator.length + 2;
		var start = (inst._field != inst._ampmField ? (inst._field * fieldSize) :
			(inst._ampmField * fieldSize) - inst.options.separator.length +
			inst.options.ampmPrefix.length);
		var end = start + (inst._field != inst._ampmField ? 2 : inst.options.ampmNames[0].length);
		if (input.setSelectionRange) { // Mozilla
			input.setSelectionRange(start, end);
		}
		else if (input.createTextRange) { // IE
			var range = input.createTextRange();
			range.moveStart('character', start);
			range.moveEnd('character', end - inst.input.val().length);
			range.select();
		}
		if (!input.disabled) {
			input.focus();
		}
	},

	/* Ensure displayed single number has a leading zero.
	   @param  value  (number) current value
	   @return  (string) number with at least two digits */
	_formatNumber: function(value) {
		return (value < 10 ? '0' : '') + value;
	},

	/* Update the input field and notify listeners.
	   @param  inst   (object) the instance settings
	   @param  value  (string) the new value */
	_setValue: function(inst, value) {
		if (value != inst.input.val()) {
			inst.input.val(value).trigger('change');
		}
	},

	/* Move to previous/next field, or out of field altogether if appropriate.
	   @param  inst     (object) the instance settings
	   @param  offset   (number) the direction of change (-1, +1)
	   @param  moveOut  (boolean) true if can move out of the field
	   @return  (boolean) true if exitting the field, false if not */
	_changeField: function(inst, offset, moveOut) {
		var atFirstLast = (inst.input.val() == '' || inst._field ==
			(offset == -1 ? 0 : Math.max(1, inst._secondField, inst._ampmField)));
		if (!atFirstLast) {
			inst._field += offset;
		}
		this._showField(inst);
		inst._lastChr = '';
		return (atFirstLast && moveOut);
	},

	/* Update the current field in the direction indicated.
	   @param  inst    (object) the instance settings
	   @param  offset  (number) the amount to change by */
	_adjustField: function(inst, offset) {
		if (inst.input.val() == '') {
			offset = 0;
		}
		this._setTime(inst, new Date(0, 0, 0,
			inst._selectedHour + (inst._field == 0 ? offset * inst.options.timeSteps[0] : 0) +
			(inst._field == inst._ampmField ? offset * 12 : 0),
			inst._selectedMinute + (inst._field == 1 ? offset * inst.options.timeSteps[1] : 0),
			inst._selectedSecond +
			(inst._field == inst._secondField ? offset * inst.options.timeSteps[2] : 0)));
	},

	/* Check against minimum/maximum and display time.
	   @param  inst  (object) the instance settings
	   @param  time  (Date) an actual time or
	                 (number) offset in seconds from now or
					 (string) units and periods of offsets from now */
	_setTime: function(inst, time) {
		time = this._determineTime(time, inst);
		var fields = this._constrainTime(inst, time ?
			[time.getHours(), time.getMinutes(), time.getSeconds()] : null);
		time = new Date(0, 0, 0, fields[0], fields[1], fields[2]);
		// Normalise to base date
		var time = this._normaliseTime(time);
		var minTime = this._normaliseTime(this._determineTime(inst.options.minTime, inst));
		var maxTime = this._normaliseTime(this._determineTime(inst.options.maxTime, inst));
		// Ensure it is within the bounds set
		time = (minTime && time < minTime ? minTime :
			(maxTime && time > maxTime ? maxTime : time));
		// Perform further restrictions if required
		if ($.isFunction(inst.options.beforeSetTime)) {
			time = inst.options.beforeSetTime.apply(inst.input[0],
				[this._getTimePlugin(inst.input[0]), time, minTime, maxTime]);
		}
		inst._selectedHour = time.getHours();
		inst._selectedMinute = time.getMinutes();
		inst._selectedSecond = time.getSeconds();
		this._showTime(inst);
	},

	/* A time may be specified as an exact value or a relative one.
	   @param  setting  (Date) an actual time or
	                    (number) offset in seconds from now or
	                    (string) units and periods of offsets from now
	   @param  inst     (object) the instance settings
	   @return  (Date) the calculated time */
	_determineTime: function(setting, inst) {
		var offsetNumeric = function(offset) { // E.g. +300, -2
			var time = new Date();
			time.setTime(time.getTime() + offset * 1000);
			return time;
		};
		var offsetString = function(offset) { // E.g. '+2m', '-4h', '+3h +30m' or '12:34:56PM'
			var fields = plugin._extractTime(inst, offset); // Actual time?
			var time = new Date();
			var hour = (fields ? fields[0] : time.getHours());
			var minute = (fields ? fields[1] : time.getMinutes());
			var second = (fields ? fields[2] : time.getSeconds());
			if (!fields) {
				var pattern = /([+-]?[0-9]+)\s*(s|S|m|M|h|H)?/g;
				var matches = pattern.exec(offset);
				while (matches) {
					switch (matches[2] || 's') {
						case 's' : case 'S' :
							second += parseInt(matches[1], 10); break;
						case 'm' : case 'M' :
							minute += parseInt(matches[1], 10); break;
						case 'h' : case 'H' :
							hour += parseInt(matches[1], 10); break;
					}
					matches = pattern.exec(offset);
				}
			}
			time = new Date(0, 0, 10, hour, minute, second, 0);
			if (/^!/.test(offset)) { // No wrapping
				if (time.getDate() > 10) {
					time = new Date(0, 0, 10, 23, 59, 59);
				}
				else if (time.getDate() < 10) {
					time = new Date(0, 0, 10, 0, 0, 0);
				}
			}
			return time;
		};
		return (setting ? (typeof setting == 'string' ? offsetString(setting) :
			(typeof setting == 'number' ? offsetNumeric(setting) : setting)) : null);
	},

	/* Normalise time object to a common date.
	   @param  time  (Date) the original time
	   @return  (Date) the normalised time */
	_normaliseTime: function(time) {
		if (!time) {
			return null;
		}
		time.setFullYear(1900);
		time.setMonth(0);
		time.setDate(0);
		return time;
	},

	/* Update time based on keystroke entered.
	   @param  inst  (object) the instance settings
	   @param  chr   (ch) the new character */
	_handleKeyPress: function(inst, chr) {
		if (chr == inst.options.separator) {
			this._changeField(inst, +1, false);
		}
		else if (chr >= '0' && chr <= '9') { // Allow direct entry of time
			var key = parseInt(chr, 10);
			var value = parseInt(inst._lastChr + chr, 10);
			var hour = (inst._field != 0 ? inst._selectedHour :
				(inst.options.show24Hours ? (value < 24 ? value : key) :
				(value >= 1 && value <= 12 ? value :
				(key > 0 ? key : inst._selectedHour)) % 12 +
				(inst._selectedHour >= 12 ? 12 : 0)));
			var minute = (inst._field != 1 ? inst._selectedMinute :
				(value < 60 ? value : key));
			var second = (inst._field != inst._secondField ? inst._selectedSecond :
				(value < 60 ? value : key));
			var fields = this._constrainTime(inst, [hour, minute, second]);
			this._setTime(inst, new Date(0, 0, 0, fields[0], fields[1], fields[2]));
			if (inst.options.noSeparatorEntry && inst._lastChr) {
				this._changeField(inst, +1, false);
			}
			else {
				inst._lastChr = chr;
			}
		}
		else if (!inst.options.show24Hours) { // Set am/pm based on first char of names
			chr = chr.toLowerCase();
			if ((chr == inst.options.ampmNames[0].substring(0, 1).toLowerCase() &&
					inst._selectedHour >= 12) ||
					(chr == inst.options.ampmNames[1].substring(0, 1).toLowerCase() &&
					inst._selectedHour < 12)) {
				var saveField = inst._field;
				inst._field = inst._ampmField;
				this._adjustField(inst, +1);
				inst._field = saveField;
				this._showField(inst);
			}
		}
	}
});

// The list of commands that return values and don't permit chaining
var getters = ['getOffset', 'getTime', 'isDisabled'];

/* Determine whether a command is a getter and doesn't permit chaining.
   @param  command    (string, optional) the command to run
   @param  otherArgs  ([], optional) any other arguments for the command
   @return  true if the command is a getter, false if not */
function isNotChained(command, otherArgs) {
	if (command == 'option' && (otherArgs.length == 0 ||
			(otherArgs.length == 1 && typeof otherArgs[0] == 'string'))) {
		return true;
	}
	return $.inArray(command, getters) > -1;
}

/* Attach the time entry functionality to a jQuery selection.
   @param  options  (object) the new settings to use for these instances (optional) or
                    (string) the command to run (optional)
   @return  (jQuery) for chaining further calls or
            (any) getter value */
$.fn.timeEntry = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (isNotChained(options, otherArgs)) {
		return plugin['_' + options + 'Plugin'].
			apply(plugin, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			if (!plugin['_' + options + 'Plugin']) {
				throw 'Unknown command: ' + options;
			}
			plugin['_' + options + 'Plugin'].
				apply(plugin, [this].concat(otherArgs));
		}
		else {
			// Check for settings on the control itself
			var inlineSettings = ($.fn.metadata ? $(this).metadata() : {});
			plugin._attachPlugin(this, $.extend({}, inlineSettings, options || {}));
		}
	});
};

/* Initialise the time entry functionality. */
var plugin = $.timeEntry = new TimeEntry(); // Singleton instance

})(jQuery);

var process = process || {env: {NODE_ENV: "development"}};
/*******************************************************************************
 Copyright 2012-2024 Ellucian Company L.P. and its affiliates.
 *******************************************************************************/

(function($) {

    function MultiCalendarsPicker() {
        this.calendarContainer = 'multiCalendarContainer';
        this.calendarIdPrefix = 'multiCalendar';
        this.TO = 'To';
        this.CALENDAR_GREGORIAN = 'gregorian';
        this.DEFAULT_DATE_FORMAT = 'mm/dd/yyyy';
        this.JAVA_DATE_FORMAT = 'MM/dd/yyyy';
        this._CAL_LOCALE_PARAMS_THAT_ARE_ARRAYS = ['epochs', 'monthNames', 'monthNamesShort', 'dayNames', 'dayNamesShort', 'dayNamesMin'];
        this._isCalendarShown = false;
        this._isTimeBoxShown = false;
        this._currentObj = null;
        this.activeCalendar = 1;
        this.numberOfCalendars;
        this.timeBoxContainer = 'timeBoxContainer';
        this.currentDateBoxValue = '';

        this._defaults = {
            defaultCalendar: this.CALENDAR_GREGORIAN,
            defaultDateFormat: this.DEFAULT_DATE_FORMAT,
            displayDateFormat: this.DEFAULT_DATE_FORMAT,
            converters: [],
            dateFormats: {},
            orientation: 'horizontal',
            language: 'en',
            isRTL: false,
            calendars: this.CALENDAR_GREGORIAN,
            firstDayOfTheWeek: 0,
            todaysDates:[],
            buttonImage: '',
            buttonClass: '',
            showOn: 'focus',
            showTime: false,
            timeFormat: 'kk:mm:ss'

        };

        $(document).mousedown(this._checkExternalClick);
        $(document).mousedown(this._checkExternalClickForTimeBox);

    }

    $.extend(MultiCalendarsPicker.prototype, {
        _markerClass: 'hasMultiCalendarPicker',

        _createDatePickerDOMStructure : function(inst) {

            var calendarOptions = inst.settings;
            $('#' + this.calendarContainer).remove();
            var DOMStructure = '<div id="' + this.calendarContainer + '" class="' + calendarOptions.orientation + '" style="display:none;" ><div id="sceenReaderText" aria-live="rude" aria-atomic="true"></div>';
            var calendars = calendarOptions.calendars;
            var numberOfCalendars = calendars.length;
            if(calendars && numberOfCalendars > 0) {
                for(var i = 0; i < numberOfCalendars; i++) {
                    DOMStructure += '<div id="' + this.calendarIdPrefix  + (i + 1) + '"></div>';
                }
            }

            DOMStructure += '<div id="multiCalenderIdCheck">'+ $.i18n.prop("datepicker.toggle.text") +'<input id="checkId" name="Calendar" type="checkbox" checked onchange="hideCalender()"/></div></div>';


            $(inst).focus();

           $(document).find('body').append(DOMStructure);

            if(isRTLMode() && screen.width <768)
            {
                $('#multiCalendar2').addClass('activeCalendar');
                $('#multiCalendar1').addClass('activeCalendar');

            }
            else{
                $('#multiCalenderIdCheck').css('display','none');
            }




        },

        concatTimePart: function (inst, data) {
            var timeEntered = $.multicalendar.extractTimePart(inst);
            data = data + " " + timeEntered;
            return data.trim();
        },

        _addCalendarsToDOM : function (inst) {
            var calendarOptions = inst.settings;
            var calendars = calendarOptions.calendars;
            var numberOfCalendars = calendars.length;

            if(calendars && numberOfCalendars > 0) {
                for(var i = 0; i < numberOfCalendars; i++) {
                    var dateFormat = calendarOptions.dateFormats[calendars[i]];
                    dateFormat = dateFormat ? dateFormat : ( calendarOptions.displayDateFormat ? calendarOptions.displayDateFormat : calendarOptions.defaultDateFormat);

                    var isRTL = false;
                    if(calendarOptions.isRTL && calendarOptions.isRTL == true) {
                        isRTL = true;
                    }
                    $('#' + this.calendarIdPrefix + (i + 1)).calendarsPicker({
                        altField: '#' + inst.id,
                        calendar: $.calendars.instance(calendars[i]),
                        isRTL: isRTL,
                        firstDay: parseInt(calendarOptions.firstDayOfTheWeek),
                        dateFormat: dateFormat,
                        minDate: calendarOptions.minDate,
                        maxDate: calendarOptions.maxDate,
                        onSelect: function ( target ) {
                            if(target[0]) {
                                $(inst).focus();

                                var settings = inst.settings;
                                var calendarOrder = $.multicalendar._getCalendarOrder(this.id);
                                var onSelectExt = inst.settings.onSelect? inst.settings.onSelect : null;
                                if(settings.defaultCalendar != calendars[calendarOrder]) {
                                    if($.multicalendar._isFormatDateAServiceCall(calendarOrder, settings)) {
                                        $.multicalendar._formatDateAsAService(calendarOrder, inst, target[0].formatDate());
                                    }
                                    else if($.multicalendar._isFormatDateAFunctionCall(calendarOrder, settings)) {
                                        var data = target[0].formatDate();
                                        var formatDate = $.multicalendar._getFormatFn(calendarOrder, settings);
                                        data = formatDate(data);
                                        data = $.multicalendar.concatTimePart(inst, data);
                                        $(inst).val(data);
                                        if(onSelectExt) {
                                            onSelectExt(data,inst );
                                        }
                                    }
                                    else {
                                        //console.log('no change');
                                    }
                                }
                                else{
                                    var data = target[0].formatDate();
                                    data = $.multicalendar.concatTimePart(inst, data);
                                    $(inst).val(data);

                                    if(onSelectExt) {
                                        onSelectExt(data ,inst);
                                    }
                                }
                            }
                            $.multicalendar._hideCalendar(inst);
                        }
                    });
                    $.calendars.instance(calendars[i]).local.dateFormat = dateFormat;
                }
            }
        },

        _getConverterName : function (from, to) {
            return from + $.multicalendar.TO + to.charAt(0).toUpperCase() + to.substr(1).toLowerCase();
        },

        _isFormatDateAServiceCall : function (calendarOrder, calendarOptions) {
            var isServiceCall = false;
            var defaultCalendar = calendarOptions.defaultCalendar;
            var calendars = calendarOptions.calendars;
            var selectedCalendar = calendars[calendarOrder];
            var converterName = $.multicalendar._getConverterName(selectedCalendar, defaultCalendar);

            if(calendarOptions.converters[converterName]
                && calendarOptions.converters[converterName].format
                && calendarOptions.converters[converterName].format.url) {
                isServiceCall = true;
            }
            return isServiceCall;
        },

        unbind : function(inst) {
            $(inst).nextAll('.calendar-icon').remove();
            $(inst).get(0).isInstantiated = false;
        },

        _isFormatDateAFunctionCall : function (calendarOrder, calendarOptions) {
            var isFunctionCall = false;
            var defaultCalendar = calendarOptions.defaultCalendar;
            var calendars = calendarOptions.calendars;
            var selectedCalendar = calendars[calendarOrder];
            var converterName = $.multicalendar._getConverterName(selectedCalendar, defaultCalendar);

            if(calendarOptions.converters[converterName]
                && calendarOptions.converters[converterName].format
                && (typeof calendarOptions.converters[converterName].format) == 'function') {
                isFunctionCall = true;
            }
            return isFunctionCall;
        },

        _getFormatFn : function (calendarOrder, calendarOptions) {
            var defaultCalendar = calendarOptions.defaultCalendar;
            var calendars = calendarOptions.calendars;
            var selectedCalendar = calendars[calendarOrder];
            var converterName = $.multicalendar._getConverterName(selectedCalendar, defaultCalendar);

            return calendarOptions.converters[converterName].format;
        },

        _convertDateBetweenCalendarFormats_old : function(fromCalendar, toCalendar, date) {
            var toCalendarObj = $.calendars.calendars[toCalendar].prototype;

            var fromCalLocalProps = $.calendars._localCals[fromCalendar + '-'].local;
            var cDateObj = toCalendarObj.parseDate(fromCalLocalProps.dateFormat, date, toCalendarObj.regional['']);

            var toCalLocalProps = $.calendars._localCals[toCalendar + '-'].local;
            $.extend(toCalendarObj, toCalendarObj.local? {} : {local: toCalLocalProps});
            date = toCalendarObj.formatDate(toCalendarObj.local.dateFormat, cDateObj);
            return date;
        },

        _convertDateBetweenCalendarFormats : function(calendar, fromFormat, toFormat, date) {
            var calendarObj = $.calendars.calendars[calendar].prototype;

            var calLocalProps = $.calendars._localCals[calendar + '-'].local;
            var cDateObj = calendarObj.parseDate(fromFormat, date, calLocalProps);

            $.extend(calendarObj, calendarObj.local? {} : {local: calLocalProps});
            date = calendarObj.formatDate(toFormat, cDateObj);
            return date;
        },

        _getDateFormat : function (calendar) {
            var calendarProps = $.calendars._localCals[calendar + '-'].local;
            return calendarProps.dateFormat;
        },


        _formatDateAsAService : function(calendarOrder, inst, date) {
            var calendarOptions = inst.settings;
            var defaultCalendar = calendarOptions.defaultCalendar;
            var calendars = calendarOptions.calendars;
            var selectedCalendar = calendars[calendarOrder];
            var converterName = $.multicalendar._getConverterName(selectedCalendar, defaultCalendar);
            var formatProps = calendarOptions.converters[converterName].format;
            var nameOfDateParam = formatProps.nameOfDateParam;

            var fromFormat = $.multicalendar._getDateFormat(selectedCalendar);
            var toFormat = calendarOptions.defaultDateFormat;
            date = $.multicalendar._convertDateBetweenCalendarFormats(selectedCalendar, fromFormat, toFormat, date);

            fromFormat = calendarOptions.defaultDateFormat;
            toFormat = $.multicalendar._getDateFormat(defaultCalendar);

            var jsonString = '{"' + nameOfDateParam + '": "' + date +'"}';
            var data = $.parseJSON(jsonString);
            data = $.extend(data, formatProps.extraParams);
            $.ajax({
                url: formatProps.url,
                data: data,
                dataType: 'text',
                success: $.multicalendar._formatDateAsAServiceSuccess(defaultCalendar, fromFormat, toFormat, inst)
            });

        },

        _formatDateAsAServiceSuccess: function (selectedCalendar, fromFormat, toFormat, inst) {
            var calendarOptions = inst.settings;
            var onSelectExt = inst.settings.onSelect? inst.settings.onSelect : null;
            return function (date) {

                date = $.multicalendar._convertDateBetweenCalendarFormats(selectedCalendar, fromFormat, toFormat, date);

                date = $.multicalendar.concatTimePart(inst, date);
                $(inst).val(date);

                if(onSelectExt) {
                    onSelectExt(date ,inst );
                }
            }
        },

        adjustPositionOfCalendar: function (inst) {
            var screenHeightAvailable = $(window).height()
            var screenWidthAvailable = $(window).width();
            var instPosition = $(inst).offset();
            var instHeight = $(inst).outerHeight();
            var instWidth = $(inst).outerWidth();
            var pickerContainerHeight = $("#" + this.calendarContainer + "> #multiCalendar1").height();
            var firstPickerOuterWidth = $("#" + this.calendarContainer + " .hasCalendarsPicker:first .ui-datepicker").outerWidth();
            var lastPickerOuterWidth = $("#" + this.calendarContainer + " .hasCalendarsPicker:first .ui-datepicker").outerWidth();
            var pickerContainerWidth = $('.hasCalendarsPicker').length > 1 ? firstPickerOuterWidth + lastPickerOuterWidth : firstPickerOuterWidth;
            if ((screenHeightAvailable - instPosition.top) + instHeight - 30 >= pickerContainerHeight) {
                $("#" + this.calendarContainer).css({top: (instPosition.top) + "px"});
            }
            else {
                $("#" + this.calendarContainer).css({top: (screenHeightAvailable - pickerContainerHeight - 45) + "px"});
            }
            if ((screenWidthAvailable - instPosition.left - instWidth) > pickerContainerWidth) {
                $("#" + this.calendarContainer).css({left: (instPosition.left + instWidth) + "px"});
            }
            else if ((screenWidthAvailable - instPosition.left - 35) > lastPickerOuterWidth) {
                $("#" + this.calendarContainer).css({left: (screenWidthAvailable - instPosition.left) + "px"});
            } else {
                $("#" + this.calendarContainer).css({right: (screenWidthAvailable - instPosition.left) + "px"});
            }

            if (instPosition.left >= firstPickerOuterWidth && $('.hasCalendarsPicker').length > 1 && screenWidthAvailable - instPosition.left >= lastPickerOuterWidth) {
                $("#" + this.calendarContainer).css({left: (instPosition.left - firstPickerOuterWidth) + "px"});
            }

        },

        toggleCalendar: function(inst){
            if($.multicalendar._isCalendarShown && $.multicalendar._currentObj && $.multicalendar._currentObj.get(0) === inst) {
                $.multicalendar._hideCalendar(inst);
            }
            else {
                $.multicalendar._createDatePickerDOMStructure(inst);
                $.multicalendar._addCalendarsToDOM(inst);
                $.multicalendar._showDateInCalendar(inst);

                if(inst) {
                    $.multicalendar._showCalendar(inst);
                }
            }
        },

        _hideCalendar : function (inst) {
            $.multicalendar._isCalendarShown = false;
            $.multicalendar._removeAriaDescriptionFromCalendar();
            $("#" + this.calendarContainer).hide("slow");
            $.multicalendar.activeCalendar = null;

            var onClose = inst.settings.onClose || function(){};
            onClose.apply((inst.input ? inst.input[0] : null),
                          [(inst.input ? inst.input.val() : ''), inst]);
            $(inst).removeAttr('readOnly');
        },


        _showCalendar : function (inst) {

            $(inst).attr('readOnly','readnly');
            $(inst).focus();
            //input.focus()
            if(!$('#multiCalendarContainer').length){

                $.multicalendar._createDatePickerDOMStructure(inst);
                $.multicalendar._addCalendarsToDOM(inst);
                $.multicalendar._showDateInCalendar(inst);

            }
            $.multicalendar._addAriaDescriptionToCalendar();
            $("#" + this.calendarContainer).show("slow");
            $.multicalendar.activeCalendar = 1;
            $('#' + $.multicalendar.calendarIdPrefix + $.multicalendar.activeCalendar ).addClass('activeCalendar');



           if(screen.width>=768){
            this.adjustPositionOfCalendar(inst)};
            $.multicalendar._isCalendarShown = true;
            $.multicalendar._currentObj = $(inst);
        },

        _addAriaDescriptionToCalendar: function() {
            var calendarariaInfo = "<span id='calendarInfo' aria-live='polite' aria-atomic='false'>";
            calendarariaInfo += $.i18n.prop("js.datepicker.info");
            calendarariaInfo +="</span>";
            $('#' + this.calendarContainer).append(calendarariaInfo);
        },

        _removeAriaDescriptionFromCalendar: function() {
            $('#' + this.calendarContainer).children('#calendarInfo').remove();
        },

        _showDateInCalendarSuccessCallback : function (selectedCalendar, fromFormat, toFormat, calendarIndex, inputElementId, originalDate) {
            return function(date) {

                date = $.multicalendar._convertDateBetweenCalendarFormats(selectedCalendar, fromFormat, toFormat, date);
                try {
                    $.calendars.picker.setDate($('#' + $.multicalendar.calendarIdPrefix + (calendarIndex + 1) )[0], date, null, true);
                }
                catch (e) {
                    //do nothing
                }
                $('#' + inputElementId).val(originalDate);
            }
        },


        _showDateInCalendar : function(inst) {
            var date = $(inst).val();
            date = this.extractDatePart(inst);

            if(date != '') {

                var calendarOptions = inst.settings;
                var defaultCalendar = calendarOptions.defaultCalendar;
                var calendars = calendarOptions.calendars;
                var numberOfCalendars = calendars.length;
                var originalDate = $.multicalendar.currentDateBoxValue = date;

                if(calendars && numberOfCalendars > 0) {
                    for(var i = 0; i < numberOfCalendars; i++) {
                        if(calendars[i] == defaultCalendar) {
                            try {
                                $.calendars.picker.setDate($('#' + $.multicalendar.calendarIdPrefix + (i + 1) )[0], originalDate, null, true);
                            }
                            catch(e) {
                                //do nothing
                            }
                            $(inst).val($.multicalendar.currentDateBoxValue);
                        }
                        else {
                            var converterName = $.multicalendar._getConverterName(defaultCalendar, calendars[i]);
                            if($.multicalendar._isConverterDefined(calendarOptions, converterName)) {
                                var formatProps = calendarOptions.converters[converterName].format;
                                var nameOfDateParam = formatProps.nameOfDateParam;

                                var fromFormat = $.multicalendar._getDateFormat(defaultCalendar);
                                var toFormat = calendarOptions.defaultDateFormat;
                                date = $.multicalendar._convertDateBetweenCalendarFormats(defaultCalendar, fromFormat, toFormat, originalDate);

                                fromFormat = calendarOptions.defaultDateFormat;
                                toFormat = $.multicalendar._getDateFormat(calendars[i]);

                                var jsonString = '{"' + nameOfDateParam + '": "' + date +'"}';
                                var data = $.parseJSON(jsonString);
                                data = $.extend(data, formatProps.extraParams);
                                $.ajax({
                                    url: formatProps.url,
                                    data: data,
                                    dataType: 'text',
                                    success: $.multicalendar._showDateInCalendarSuccessCallback(calendars[i], fromFormat, toFormat, i, inst.id, $.multicalendar.currentDateBoxValue)
                                });
                            }
                            else {
                                $(inst).val($.multicalendar.currentDateBoxValue);
                            }
                        }
                    }
                }
            }
        },

        _isConverterDefined : function (calendarOptions, converter) {
            var isConverterDefined = false;
            if(calendarOptions.converters
                && calendarOptions.converters[converter]) {
                isConverterDefined = true;
            }
            return isConverterDefined;
        },

        _todaysDate : function(calendar) {
            var cDate = $.multicalendar._defaults.todaysDates[calendar.local.name.toLowerCase()];
            if(!cDate) {
                cDate = calendar.today();
            }
            return cDate;
        },

        _getTodayDates : function (calendarOptions) {
            var defaultCalendar = calendarOptions.defaultCalendar;
            var calendars = calendarOptions.calendars;
            var numberOfCalendars = calendars.length;

            var calendar = $.calendars.calendars[$.multicalendar.CALENDAR_GREGORIAN].prototype;
            var dateFormat = calendarOptions.defaultDateFormat;

            var cDateObj = calendar.parseDate(dateFormat, $.calendars.newDate().formatDate(dateFormat), calendar.regional[''])
            $.multicalendar._defaults.todaysDates[$.multicalendar.CALENDAR_GREGORIAN] = cDateObj;

            if(calendars && numberOfCalendars > 0) {
                for(var i = 0; i < numberOfCalendars; i++) {
                    if(this.CALENDAR_GREGORIAN != calendars[i]) {
                        var converterName = $.multicalendar._getConverterName(this.CALENDAR_GREGORIAN, calendars[i]);
                        if($.multicalendar._isConverterDefined(calendarOptions, converterName)) {
                            var formatProps = calendarOptions.converters[converterName].format;

                            var nameOfDateParam = formatProps.nameOfDateParam;
                            var jsonString = '{"' + nameOfDateParam + '": "' + $.calendars.newDate().formatDate(dateFormat) +'"}';
                            var data = $.parseJSON(jsonString);
                            data = $.extend(data, formatProps.extraParams);
                            $.ajax({
                                url: formatProps.url,
                                data: data,
                                dataType: 'text',
                                success: $.multicalendar._storeTodaysDateSuccessCallback(calendarOptions, calendars[i])
                            });
                        }
                    }
                }
            }
        },


        getCalendar : function(calendarName){
            var calendarObj = $.calendars.calendars[calendarName].prototype;
            var calLocalProps = $.calendars._localCals[calendarName + '-'].local;
            $.extend(calendarObj, calendarObj.local? {} : {local: calLocalProps});
            return calendarObj;
        },

        _storeTodaysDateSuccessCallback : function (calendarOptions, calendar) {
            return function(date) {
                var calendarObj = $.calendars.calendars[calendar].prototype;
                var dateFormat = calendarOptions.defaultDateFormat;

                var calLocalProps = $.calendars._localCals[calendar + '-'].local;
                $.extend(calendarObj, calendarObj.local? {} : {local: calLocalProps});
                var cDateObj = calendarObj.parseDate(dateFormat, date, calendarObj.regional['']);
                $.multicalendar._defaults.todaysDates[calendar] = cDateObj;
            }
        },

        _extractFullDate : function (dateString) {
            var format = $.i18n.prop('js.datepicker.dateFormat');

            var separator = '';

            if (format.indexOf('-') >= 0) {
                separator = '-';
            }
            else if (format.indexOf('/') >= 0) {
                separator = '/';
            }
            else if (format.indexOf('.') >= 0) {
                separator = '.';
            }

            if (dateString.indexOf(separator) >= 0)  {
                var dateArray = dateString.split(separator);
                var formatArray = format.split(separator);
                var yearIndex = 0;

                for(var i = 0; i < formatArray.length; i++) {
                    if(formatArray[i].toLowerCase().indexOf('y') != -1) {
                        yearIndex = i;
                        break;
                    }
                }

                if(dateArray.length > yearIndex)
                {
                    var year = dateArray[yearIndex];
                    if(year.length == 2) {
                        var yearEntered= parseInt(year);
                        year = Number($.multicalendar._getCentury(yearEntered)) + yearEntered;
                        dateArray[yearIndex] = year;
                        dateString = dateArray.join(separator);
                    }
                }
            }
            return dateString;
        },

        _registerEvents : function (inst) {
            var settings = inst.settings;
            var showOn = settings.showOn

            $(inst).change( function (evt) {
                try {
                    var valEntered = $(inst).val();
                    if (evt.target.settings.showTime) {
                        $(inst).val(valEntered);
                        return;
                    }
                    var cDateObj;

                    valEntered = $.multicalendar._extractFullDate(valEntered);
                    var defaultCalendar = settings.defaultCalendar;
                    if($.multicalendar.isValidDateFormat(defaultCalendar, valEntered)) {
                        $(inst).val(valEntered);
                        return;
                    }

                    var calendar = $.calendars.instance(defaultCalendar);

                    var displayFormat = $.i18n.prop("js.datepicker.dateFormat");

                    if (valEntered.length == 1 && isNaN(valEntered)){
                        // put system date
                        cDateObj = calendar.today();
                    } else {
                        var matches = valEntered.match( /\d+/g );
                        // no special characters
                        if (matches.length == 1){
                            if(valEntered.length > 2 ){
                                //slice by 2 characers
                                matches = valEntered.match(/.{2}/g);
                            }
                        }
                        if(cDateObj == null){
                            var dateFormat = $.i18n.prop("default.dateEntry.format").toLowerCase();//calendar.local.dateFormat.toLowerCase();
                            var dateArr = {
                                'd': dateFormat.indexOf("d"),
                                'm': dateFormat.indexOf("m"),
                                'y': dateFormat.indexOf("y")
                            };

                            var sortable = [];
                            for (var val in dateArr)
                                sortable.push([val, dateArr[val]]);
                            sortable.sort(function(a, b) {return a[1] - b[1]});

                            cDateObj = calendar.today();
                            var day = cDateObj.day();
                            var month = cDateObj.month();
                            var year = cDateObj.year();
                            for (i = 0; i < matches.length; i++){
                                if(sortable[i][0] == "y"){
                                    if(matches[i].length == 2) {
                                        var yearEntered= Number(matches[i]);
                                        year = yearEntered + Number($.multicalendar._getCentury(yearEntered));
                                    }
                                    else{
                                        year= matches[i];
                                    }
                                } else if (sortable[i][0] == "m") {
                                    month = matches[i];
                                } else {
                                    day = matches[i];
                                }
                            }

                            try {
                                cDateObj = cDateObj.newDate(year, month, day);
                            }
                            catch(e) {
                                cDateObj = null;
                                return;
                            }
                        }
                    }

                    if(cDateObj)
                        var dateStr = calendar.formatDate(calendar.local.dateFormat, cDateObj);

                    $(inst).val(dateStr);
                } catch(e) {
                }
            });

            if(showOn == "both" || showOn == "focus") {
                $(inst).focus( function (evt) {
                    if(!$.multicalendar._isCalendarShown || ($.multicalendar._currentObj && $.multicalendar._currentObj.get(0) !== $(evt.target).get(0))) {
                        $.multicalendar._createDatePickerDOMStructure(inst);
                        $.multicalendar._addCalendarsToDOM(inst);
                        $.multicalendar._showDateInCalendar(inst);
                        $.multicalendar._showCalendar(this);
                    }
                });
            }

            if(showOn == "both" || showOn == "button") {
                //var img = $(inst).next('img');
                //$(img).click( function (evt) {
                var span = $(inst).next('span');
                $(span).click( function (evt) {
                    var input = $(this).prev('input.' + $.multicalendar._markerClass);
                    if($.multicalendar._isCalendarShown && $.multicalendar._currentObj && $.multicalendar._currentObj.get(0) === input.get(0)) {
                        $.multicalendar._hideCalendar(inst);
                    }
                    else {
                        $.multicalendar.currentDateBoxValue = input.val();
                        $.multicalendar._createDatePickerDOMStructure(inst);
                        $.multicalendar._addCalendarsToDOM(inst);
                        $.multicalendar._showDateInCalendar(inst);

                        if(input) {
                            $.multicalendar._showCalendar(input);
                            input.attr('readOnly','readonly');

                            $('#' + this.timeBoxContainer)
                            //$.multicalendar.currentDateBoxValue = input.val();
                        }
                    }
                });

                if(settings.showTime) {
                    var timeSpan = $(inst).nextAll('.time-icon');
                    $(timeSpan).click(function(evt) {
                        var input = $(this).prevAll('input.' + $.multicalendar._markerClass);
                        if($.multicalendar._isTimeBoxShown && $.multicalendar._currentObj && $.multicalendar._currentObj.get(0) === input.get(0)) {
                            $.multicalendar._hideTimeBox();
                        }
                        else {
                            $.multicalendar.currentDateBoxValue = input.val();
                            $.multicalendar._showTimeBox(inst);
                        }
                    });
                }

                if(showOn == "button") {
                    $(inst).focus( function (evt) {
                        if($.multicalendar._currentObj && $.multicalendar._currentObj.get(0) !== $(evt.target).get(0)) {
                            $.multicalendar._hideCalendar(inst);
                        }
                    });
                }
            }

            $(inst).dblclick(function (evt) {
                $.multicalendar.toggleCalendar(evt.target);
            });

            $(inst).bind('keydown keypress', function (evt) {

                if(evt.type == 'keydown' && evt.keyCode == 120) {
                    $.multicalendar.toggleCalendar(evt.target);
                    evt.preventDefault();
                    evt.stopPropagation();

                }
                else if($.multicalendar._isCalendarShown){
                    var activeCalendar = $('#' + $.multicalendar.calendarIdPrefix + $.multicalendar.activeCalendar )[0];
                    if(evt.type == 'keydown') $.calendars.picker.keyDownMultipicker( evt, activeCalendar);
                    else $.calendars.picker.keyPressMultipicker( evt, activeCalendar);
                }
                else if($.multicalendar._isTimeBoxShown && evt.keyCode == 27){
                    $.multicalendar._hideTimeBox();
                    return false;
                }
            });


            $(document).on("mouseenter","#multiCalendarContainer .hasCalendarsPicker", function(){
                $('.hasCalendarsPicker').removeClass('activeCalendar');
                $(this).addClass('activeCalendar');
                $.multicalendar.activeCalendar =  $(this).attr('id').substring(13);
            });

        },

        _setTimeToInputBox : function(inst) {
            if(!$(inst).value) {
                inst = $(inst).get(0);
            }

            // var timeEntered = $(inst).val();
            var date = this.extractDatePart(inst);
            var newDate = date + " " + $('#_timebox_').val();
            $(inst).val(newDate.trim());
            $(inst).focus();
        },


        extractTimePart : function (inst) {
            var timeFormat = inst.settings.timeFormat;
            var dataToParse = $.multicalendar.currentDateBoxValue;
            var timePattern = this.getRegExForTimeFormat(timeFormat);
            var regEx = new RegExp("" + timePattern + "$", "g");
            var matches = dataToParse.match(regEx);
            if(matches) {
                return matches[0].trim();
            } else {
                return "";
            }
        },

        extractDatePart : function(inst) {
            var dataToParse = $(inst).val()

            if (inst.settings.showTime) {
                var timeFormat = inst.settings.timeFormat;
                var dataToParse = $(inst).val();
                var time = this.extractTimePart(inst);
                return dataToParse.replace(time, '').trim();
            } else {
                return dataToParse
            }

        },

        extractDateFromDateTime : function(data, dateFormat, timeFormat) {
            var time = this.extractTimeFromDateTime(data, dateFormat, timeFormat);
            return data.replace(time, '').trim();
        },

        extractTimeFromDateTime : function(data, dateFormat, timeFormat) {
            var timePattern = this.getRegExForTimeFormat(timeFormat);
            var regEx = new RegExp("" + timePattern + "$", "g");
            var matches = data.match(regEx);
            if(matches) {
                return matches[0].trim();
            } else {
                return "";
            }
        },

        getRegExForTimeFormat : function(timeFormat) {
            var timeFormatToPattern = timeFormat;
            var NUMBER_PATTERN = '\\d{1,2}';
            timeFormatToPattern = timeFormatToPattern.replace('kk', NUMBER_PATTERN);
            timeFormatToPattern = timeFormatToPattern.replace('k', NUMBER_PATTERN);
            timeFormatToPattern = timeFormatToPattern.replace('KK', NUMBER_PATTERN);
            timeFormatToPattern = timeFormatToPattern.replace('K', NUMBER_PATTERN);

            timeFormatToPattern = timeFormatToPattern.replace('hh', NUMBER_PATTERN);
            timeFormatToPattern = timeFormatToPattern.replace('h', NUMBER_PATTERN);
            timeFormatToPattern = timeFormatToPattern.replace('HH', NUMBER_PATTERN);
            timeFormatToPattern = timeFormatToPattern.replace('H', NUMBER_PATTERN);

            timeFormatToPattern = timeFormatToPattern.replace('mm', NUMBER_PATTERN);
            timeFormatToPattern = timeFormatToPattern.replace('ss', NUMBER_PATTERN);
            timeFormatToPattern = timeFormatToPattern.replace('SS', '\\d{1,3}');

            timeFormatToPattern = timeFormatToPattern.replace('a', '.+');
            return timeFormatToPattern;
        },

        _showTimeBox: function(inst) {
            this._createTimeBoxDOMStructure(inst);
            this._adjustPositionOfTimeBox(inst);

            $("#" + this.timeBoxContainer).show("slow");
            $.multicalendar._isTimeBoxShown = true;

            $.multicalendar._currentObj = $(inst);
            $('#_timebox_select_btn').click(function() {
                $.multicalendar._setTimeToInputBox($.multicalendar._currentObj);
                $.multicalendar._hideTimeBox();
            });

            var timeOptions = this._interpretTimeConfigOptions(inst);
            $('#_timebox_').timeEntry(timeOptions);

            var time = $.multicalendar.extractTimePart(inst);
            $('#_timebox_').timeEntry('setTime', time);
        },

        _hideTimeBox : function () {
            $.multicalendar._isTimeBoxShown = false;
            $("#" + this.timeBoxContainer).hide("slow");
        },

        _createTimeBoxDOMStructure: function(inst) {
            $('#' + this.timeBoxContainer).remove();
            var DOMStructure = '<div id="' + this.timeBoxContainer + '"><div id="sceenReaderText" aria-live="rude" aria-atomic="true"></div>';
            DOMStructure += 'Time: <input type="text" id="_timebox_"/>&nbsp;<input type="button" value="Select" id="_timebox_select_btn"/>';

            DOMStructure += '</div>';

            $(document).find('body').append(DOMStructure);
        },

        _adjustPositionOfTimeBox : function(inst) {
            var screenHeightAvailable = $(window).height()
            var screenWidthAvailable = $(window).width();
            var instPosition = $(inst).offset();
            var instHeight = $(inst).outerHeight();
            var instWidth = $(inst).outerWidth();
            var timeBoxContainerHeight = $("#" + this.timeBoxContainer).height();
            //var firstPickerOuterWidth = $("#" + this.calendarContainer + " .hasCalendarsPicker:first .ui-datepicker").outerWidth();
            //var lastPickerOuterWidth = $("#" + this.calendarContainer + " .hasCalendarsPicker:first .ui-datepicker").outerWidth();
            var timeBoxContainerWidth = $("#" + this.timeBoxContainer).outerWidth();
            if(instPosition.top + instHeight + timeBoxContainerHeight >= screenHeightAvailable && instPosition.top > timeBoxContainerHeight){
                $("#" + this.timeBoxContainer).css({top: (instPosition.top - timeBoxContainerHeight) + "px"});
            }
            else{
                $("#" + this.timeBoxContainer).css({top: (instPosition.top + instHeight) + "px"});
            }

            if(instPosition.left + timeBoxContainerWidth >= screenWidthAvailable){
                $("#" + this.timeBoxContainer).css({right: (screenWidthAvailable - instPosition.left -instWidth ) + "px"});
            }
            else {
                $("#" + this.timeBoxContainer).css({left: (instPosition.left ) + "px"});
            }

        },

        _checkExternalClick: function(event) {
            var inst = $.multicalendar._isCalendarShown && $.multicalendar._currentObj && $.multicalendar._currentObj.get(0);
            if (inst) {
                var clickedOutsideCalendar = $(event.target).parents('#' + $.multicalendar.calendarContainer).length == 0
                    && !$(event.target).hasClass($.multicalendar._markerClass);//,

                if(clickedOutsideCalendar) {
                    //if($(event.target).is('img')
                    if($(event.target).is('span')
                        && $(event.target).prev('input').hasClass($.multicalendar._markerClass)) {
                        clickedOutsideCalendar = false;
                    }
                }

                if(clickedOutsideCalendar) {
                    $.multicalendar._hideCalendar(inst);
                }
            }
        },

        _checkExternalClickForTimeBox: function(event) {
            var clickedOutsideTimeBox = true;

            if($(event.target).is('#' + $.multicalendar.timeBoxContainer)) {
                clickedOutsideTimeBox = false;
            }

            if(clickedOutsideTimeBox && $(event.target).parents('#timeBoxContainer').length > 0) {
                clickedOutsideTimeBox = false;
            }

            if(clickedOutsideTimeBox) {
                //if($(event.target).is('img')
                if($(event.target).is('span') && $(event.target).hasClass('time-icon')
                    && $(event.target).prevAll('input').hasClass($.multicalendar._markerClass)) {
                    clickedOutsideTimeBox = false;
                }
            }

            if(clickedOutsideTimeBox) {
                $.multicalendar._hideTimeBox();
            }
        },

        _getCalendarOrder: function (id) {
            return parseInt(id.replace($.multicalendar.calendarIdPrefix,'')) - 1;
        },

        setDefaults: function(settings) {
            if(settings.firstDayOfTheWeek && isNaN(settings.firstDayOfTheWeek)) {
                settings.firstDayOfTheWeek = $.multicalendar._defaults.firstDayOfTheWeek;
            }

            $.extend(this._defaults, settings || {});

            settings.calendars=this._defaults.calendars;
            if(settings.calendars && typeof settings.calendars == 'string') {
                settings.calendars = [settings.calendars];
            }
            else {
                var calendars = $.extend([], $.multicalendar._removeInvalidCalendars(settings.calendars));
                var newCalendarsList = new Array();
                for(var i = 0, j = 0; i < calendars.length; i++) {
                    if(calendars[i] && $.trim(calendars[i]) != '') {
                        newCalendarsList[j] = calendars[i];
                        j++;
                    }

                }
                settings.calendars = newCalendarsList;
            }
            /*settings.defaultDateFormat=this._defaults.defaultDateFormat;
             settings.displayDateFormat=this._defaults.displayDateFormat;
             */
            $.extend(this._defaults, settings || {});

            $.multicalendar._processCalendarLocaleProps(settings);
            $.multicalendar._getTodayDates(settings);
            $.multicalendar._processTimeLocaleProps(settings);
            return this;
        },

        _processTimeLocaleProps : function(options) {
            if(options.calendars && options.timeLocaleProps) {
                $.timeEntry.setDefaults(options.timeLocaleProps);
            }
        },

        _splitString: function(stringToSplit, charIdentifier) {
            var splitArr = stringToSplit;
            if(typeof stringToSplit == "string") {
                splitArr = stringToSplit.split(charIdentifier);
                for(var i = 0; i < splitArr.length; i++) {
                    splitArr[i] = $.trim(splitArr[i]);
                }
            }
            return splitArr;
        },

        parse: function (dateString, calendarType) {
            var calendar = $.calendars.calendars[calendarType].prototype;
            var dateFormat = $.multicalendar._getDateFormat(calendarType);
            var cDateObj = calendar.parseDate(dateFormat, dateString, calendar.regional['']);
            return cDateObj;
        },

        formatCDateObject:function (cDateObj, dateFormat, calendar) {
            var calendarObj = $.calendars.calendars[calendar].prototype;
            var calLocalProps = $.calendars._localCals[calendar + '-'].local;
            $.extend(calendarObj, calendarObj.local? {} : {local: calLocalProps});
            var formattedDate = calendarObj.formatDate(dateFormat, cDateObj);
            return formattedDate;
        },

        _processCalendarLocaleProps : function (options) {
            if(options.calendars && options.calendarLocaleProps) {
                for(var i = 0; i < options.calendars.length; i++) {
                    if(options.calendarLocaleProps[options.calendars[i]]) {
                        var calendarLocaleProps = options.calendarLocaleProps[options.calendars[i]];

                        for(var key in calendarLocaleProps) {
                            var calPropValues = calendarLocaleProps[key];
                            if($.inArray(key, $.multicalendar._CAL_LOCALE_PARAMS_THAT_ARE_ARRAYS) != -1 && calPropValues.indexOf(key) == -1) {
                                calendarLocaleProps[key] = this._splitString(calPropValues, ',');
                            }
                            else {
                                delete calendarLocaleProps[key];
                            }
                        }

                        var localeCalendar = $.calendars.calendars[options.calendars[i]];
                        $.extend(localeCalendar.prototype.regional[''], calendarLocaleProps);
                        $.calendars.instance(options.calendars[i]).local.dateFormat = options.displayDateFormat;
                    }
                }
            }
        },

        _removeInvalidCalendars: function (calendars) {
            for(var i = 0; i < calendars.length; i++) {
                if(!$.calendars.calendars[calendars[i]]) {
                    calendars.splice(i,1);
                    i--;
                }
            }
            return calendars;
        },

        isValidDateFormat: function(calendar, dateString) {
            var isValid = false;
            try {
                var calendarObj = $.calendars.calendars[calendar].prototype;
                var calLocalProps = $.calendars._localCals[calendar + '-'].local;
                var cDateObj = calendarObj.parseDate(calLocalProps.dateFormat, dateString, calLocalProps);
                isValid = true;
            } catch (e) {
                isValid = false;
            }
            return isValid;
        },

        _addCalendarImage: function(inst) {
            var options = inst.settings;
            //var img = $('<img>');

            /*var img = $('<img>'); //Equivalent: $(document.createElement('img'))
             img.attr('src', inst.settings.buttonImage);
             img.insertAfter($(inst));*/

            var span = $('<span>');
            span.attr('class', 'calendar-icon');
            if(options.buttonImage && options.buttonImage != '') {
                span.attr('style', 'background-image: url("' + options.buttonImage + '");');
            }
            else if(options.buttonClass && options.buttonClass != '') {
                if(options.showTime) {
                    $(span).addClass("time-" + options.buttonClass);
                } else {
                    $(span).addClass(options.buttonClass);
                }

            }
            span.insertAfter($(inst));

            if(options.showTime) {
                var timeSpan = $('<span>');
                timeSpan.attr('class', 'calendar-icon');
                /*if(options.buttonImage && options.buttonImage != '') {
                 timeSpan.attr('style', 'background-image: url("' + options.buttonImage + '");');
                 }
                 else if(options.buttonClass && options.buttonClass != '') {
                 $(timeSpan).addClass(options.buttonClass);
                 } */
                $(timeSpan).addClass('time-icon');
                timeSpan.insertAfter(span);
            }
        },

        _getCentury: function(val) {
            var century = 0;
            try{
                century = parseInt($.i18n.prop("default.century.below.pivot"));
                if (val > parseInt($.i18n.prop("default.century.pivot")))
                    century = parseInt($.i18n.prop("default.century.above.pivot"));
            }catch(e){
            }
            if(!Number(century))
                century = 0;
            return century;
        },

        _interpretTimeConfigOptions : function(inst) {
            var settings = inst.settings;
            if(!settings.timeFormat) {
                settings.timeFormat = $.multicalendar._defaults.timeFormat;
            }
            var regEx = new RegExp("\\w+", "g");
            var matches = settings.timeFormat.match(regEx);
            $.unique(matches);

            var options = "{";
            for(var counter = 0; counter < matches.length; counter++) {
                switch(matches[counter]) {
                    /*                case "hh":
                     case "h":
                     console.log("hh or h");
                     break;*/
                    case "HH":
                    case "H":
                        options += '"show24Hours": true,';
                        break;
                    case "ss":
                    case "s":
                        options += '"showSeconds": true,';
                        //console.log("ss or s");
                        break;
                    case "kk":
                    case "k":
                        options += '"show24Hours": true,'
                        //console.log("kk or k");
                        break;
                    /*                case "mm":
                     case "m":
                     console.log("mm or m");
                     break;*/
                    /*                case "KK":
                     case "K":
                     console.log("KK or K");
                     break;*/
                    /*                case "a":
                     console.log("a");
                     break;*/
                }
            }

            options += '"ampmPrefix": " ",';
            options += '"separator":":",';
            //options += '"spinnerImage": "../time/spinnerUpDown.png",';
            options += '"spinnerIncDecOnly": true,';
            options += '"spinnerTexts":["left", "right"],';
            options += '"spinnerSize": [15, 16, 0]';
            options += '}';

            return $.parseJSON(options);
        }
    });

    $.fn.multiCalendarPicker = function(opts) {
        var inst = $(this)[0];
        var dateariaLabel = $(inst).attr('aria-label');
        var dateFormat = $.i18n.prop("default.date.format");
        var datepickerInfo = $.i18n.prop("js.input.datepicker.info");
        //Aria workaround:Introduce blank space so that reader reads as abbreviations
        dateFormat = dateFormat.split("").join(" ");
        dateariaLabel=dateariaLabel+" "+$.i18n.prop("js.input.datepicker.dateformatinfo")+" "+dateFormat;
        $(inst).attr('aria-label',dateariaLabel);
        $(inst).attr('title',datepickerInfo);
        if (!inst.isInstantiated) {
            if(opts && opts.firstDayOfTheWeek && isNaN(opts.firstDayOfTheWeek)) {
                opts.firstDayOfTheWeek = $.multicalendar._defaults.firstDayOfTheWeek;
            }
            var options = $.extend([], $.multicalendar._defaults, opts);

            inst.settings = options;

            $(inst).addClass($.multicalendar._markerClass);

            if(inst.settings.showTime) {
                $(inst).addClass('hasTimePicker');
            }

            if((options.buttonImage && options.buttonImage != '') || options.buttonClass && options.buttonClass != '') {
                $.multicalendar._addCalendarImage(inst);
            }

            $.multicalendar._registerEvents(inst);

            inst.isInstantiated = true;
        }
    }

    $.multicalendar = new MultiCalendarsPicker(); // singleton instance

})(jQuery);
var hideCalender=function(){

    if($('#checkId').is(":checked")){

        $('#multiCalendar1').hide();
        $('#multiCalendar2').show();
    }
    else{
        $('#multiCalendar2').hide();
        $('#multiCalendar1').show();
    }
}

var process = process || {env: {NODE_ENV: "development"}};
// add :focus selector
jQuery.expr[':'].focus = function( elem ) {
  return elem === document.activeElement && ( elem.type || elem.href );
};

$(function() {
    // requires _ and jquery.editable to be initialized
    $.datepicker._doKeyDown = _.wrap( $.datepicker._doKeyDown, function(func, event) {
        if ( !this._pressedKeys && event.keyCode == 13 ) {
            // if ENTER is the first keypress in the open datepicker, just close it
            $.datepicker._hideDatepicker();
        } else {
            this._pressedKeys = true;
            return func( event );
        }
    });

$.editable.addInputType( 'datepicker', { // note that this hides banner_ui_ss jquery.jeditable.datepicker.js

        /* create input element */
        element: function( settings, original ) {
            var form = $( this ),
            input = $( '<input id="multiCalendarDestination"/>' );
            input.attr( 'autocomplete','off' );
            form.append( input );
            return input;
        },

        /* attach jquery.ui.datepicker to the input element */
        plugin: function( settings, original ) {
            var form = this,
            input = form.find( "input" );

            // Don't cancel inline editing onblur to allow clicking datepicker
            // this is the jeditable settings, not the datepicker options
            settings.onblur = 'nothing';


            var datepicker = jQuery.extend( {}, settings.datepicker, {
                onSelect: function() {
                    // clicking specific day in the calendar should
                    // submit the form and close the input field
                    form.submit();
                    var handler = settings.datepicker.onSelect;
                    return handler && handler.apply( this, arguments );
                },

                onClose: function() {
                    setTimeout( function() {
                        if ( !input.is( ':focus' ) ) {
                            // input has NO focus after 150ms which means
                            // calendar was closed due to click outside of it
                            // so let's close the input field without saving
                            original.reset( form );
                        } else {
                            // input still HAS focus after 150ms which means
                            // calendar was closed due to Enter in the input field
                            // so lets submit the form and close the input field
                            form.submit();
                        }
                        var handler = settings.datepicker.onClose;
                        return handler && handler.apply( this, arguments );

                        // the delay is necessary; calendar must be already
                        // closed for the above :focus checking to work properly;
                        // without a delay the form is submitted in all scenarios, which is wrong
                    }, 150 );
                }
            });

            if (settings.datepicker) {
                jQuery.extend(datepicker, settings.datepicker);
            }

            input.multiCalendarPicker(datepicker);
        }
    } );
});

var process = process || {env: {NODE_ENV: "development"}};
﻿(function(){
    $.extend($.calendars.picker.commands,

        { // Command actions that may be added to a layout by name
            // name: { // The command name, use '{button:name}' or '{link:name}' in layouts
            //		text: '', // The field in the regional settings for the displayed text
            //		status: '', // The field in the regional settings for the status text
            //      // The keystroke to trigger the action
            //		keystroke: {keyCode: nn, ctrlKey: boolean, altKey: boolean, shiftKey: boolean},
            //		enabled: fn, // The function that indicates the command is enabled
            //		date: fn, // The function to get the date associated with this action
            //		action: fn} // The function that implements the action
            prev: {text: 'prevText', status: 'prevStatus', // Previous month
                keystroke: {keyCode: 33}, // Page up
                enabled: function(inst) {
                    var minDate = inst.curMinDate();
                    return (!minDate || inst.drawDate.newDate().
                        add(1 - inst.get('monthsToStep') - inst.get('monthsOffset'), 'm').
                        day(inst.get('calendar').minDay).add(-1, 'd').compareTo(minDate) != -1); },
                date: function(inst) {
                    return inst.drawDate.newDate().
                        add(-inst.get('monthsToStep') - inst.get('monthsOffset'), 'm').
                        day(inst.get('calendar').minDay); },
                action: function(inst) {
                    $.calendars.picker.changeMonth(this, -inst.get('monthsToStep')); }
            },
            prevJump: {text: 'prevJumpText', status: 'prevJumpStatus', // Previous year
                keystroke: {keyCode: 33, ctrlKey: true, shiftKey:true}, // Ctrl + shift + Page up
                enabled: function(inst) {
                    var minDate = inst.curMinDate();
                    return (!minDate || inst.drawDate.newDate().
                        add(1 - inst.get('monthsToJump') - inst.get('monthsOffset'), 'm').
                        day(inst.get('calendar').minDay).add(-1, 'd').compareTo(minDate) != -1); },
                date: function(inst) {
                    return inst.drawDate.newDate().
                        add(-inst.get('monthsToJump') - inst.get('monthsOffset'), 'm').
                        day(inst.get('calendar').minDay); },
                action: function(inst) {
                    $.calendars.picker.changeMonth(this, -inst.get('monthsToJump')); }
            },
            next: {text: 'nextText', status: 'nextStatus', // Next month
                keystroke: {keyCode: 34}, // Page down
                enabled: function(inst) {
                    var maxDate = inst.get('maxDate');
                    return (!maxDate || inst.drawDate.newDate().
                        add(inst.get('monthsToStep') - inst.get('monthsOffset'), 'm').
                        day(inst.get('calendar').minDay).compareTo(maxDate) != +1); },
                date: function(inst) {
                    return inst.drawDate.newDate().
                        add(inst.get('monthsToStep') - inst.get('monthsOffset'), 'm').
                        day(inst.get('calendar').minDay); },
                action: function(inst) {
                    $.calendars.picker.changeMonth(this, inst.get('monthsToStep')); }
            },
            nextJump: {text: 'nextJumpText', status: 'nextJumpStatus', // Next year
                keystroke: {keyCode: 34, ctrlKey: true, shiftKey:true}, // Ctrl + shift + Page down
				enabled: function(inst) {
                    var maxDate = inst.get('maxDate');
                    return (!maxDate || inst.drawDate.newDate().
                        add(inst.get('monthsToJump') - inst.get('monthsOffset'), 'm').
                        day(inst.get('calendar').minDay).compareTo(maxDate) != +1);	},
                date: function(inst) {
                    return inst.drawDate.newDate().
                        add(inst.get('monthsToJump') - inst.get('monthsOffset'), 'm').
                        day(inst.get('calendar').minDay); },
                action: function(inst) {
					$.calendars.picker.changeMonth(this, inst.get('monthsToJump')); }
            },
			current: {text: 'currentText', status: 'currentStatus', // Current month
				keystroke: {keyCode: 36, ctrlKey: true, shiftKey:true}, // Ctrl + shift + Home
				enabled: function(inst) {
					var minDate = inst.curMinDate();
					var maxDate = inst.get('maxDate');
					var curDate = inst.selectedDates[0] || inst.get('calendar').today();
					return (!minDate || curDate.compareTo(minDate) != -1) &&
						(!maxDate || curDate.compareTo(maxDate) != +1); },
				date: function(inst) {
					return inst.selectedDates[0] || inst.get('calendar').today(); },
				action: function(inst) {
					var curDate = inst.selectedDates[0] || inst.get('calendar').today();
					$.calendars.picker.showMonth(this, curDate.year(), curDate.month()); }
			},
			today: {text: 'todayText', status: 'todayStatus', // Today's month
				keystroke: {keyCode: 36, ctrlKey: true, shiftKey:true}, // Ctrl + shift +Home
				enabled: function(inst) {
					var minDate = inst.curMinDate();
					var maxDate = inst.get('maxDate');
					return (!minDate || inst.get('calendar').today().compareTo(minDate) != -1) &&
						(!maxDate || inst.get('calendar').today().compareTo(maxDate) != +1); },
				date: function(inst) { return inst.get('calendar').today(); },
				action: function(inst) { $.calendars.picker.showMonth(this); }
			},
            clear: {text: 'clearText', status: 'clearStatus', // Clear the datepicker
                keystroke: {keyCode: 35, ctrlKey: true, shiftKey:true}, // Ctrl + shift + End
                enabled: function(inst) { return true; },
                date: function(inst) { return null; },
                action: function(inst) { $.calendars.picker.clear(this); }
            },
            close: {text: 'closeText', status: 'closeStatus', // Close the datepicker
                keystroke: {keyCode: 27}, // Escape
                enabled: function(inst) { return true; },
                date: function(inst) { return null; },
                action: function(inst) {
					$.multicalendar._hideCalendar(inst);}
            },
            prevWeek: {text: 'prevWeekText', status: 'prevWeekStatus', // Previous week
                keystroke: {keyCode: 38}, // Up
                enabled: function(inst) {
                    var minDate = inst.curMinDate();
                    return (!minDate || inst.drawDate.newDate().
                        add(-inst.get('calendar').daysInWeek(), 'd').compareTo(minDate) != -1); },
                date: function(inst) { return inst.drawDate.newDate().
                    add(-inst.get('calendar').daysInWeek(), 'd'); },
                action: function(inst) { $.calendars.picker.changeDay(
                    this, -inst.get('calendar').daysInWeek()); }
			},
            prevDay: {text: 'prevDayText', status: 'prevDayStatus', // Previous day
                keystroke: {keyCode: 37}, //  Left
                enabled: function(inst) {
                    var minDate = inst.curMinDate();
                    return (!minDate || inst.drawDate.newDate().add(-1, 'd').
                        compareTo(minDate) != -1); },
                date: function(inst) { return inst.drawDate.newDate().add(-1, 'd'); },
                action: function(inst) {
					if(isRTLMode()){
						$.calendars.picker.changeDay(this, 1);
					}
					else
						$.calendars.picker.changeDay(this, -1);
				}
            },
            nextDay: {text: 'nextDayText', status: 'nextDayStatus', // Next day
                keystroke: {keyCode: 39}, // Right
                enabled: function(inst) {
					var maxDate = inst.get('maxDate');
                    return (!maxDate || inst.drawDate.newDate().add(1, 'd').
                        compareTo(maxDate) != +1); },
                date: function(inst) { return inst.drawDate.newDate().add(1, 'd'); },
                action: function(inst) {
					if (isRTLMode()) {
						$.calendars.picker.changeDay(this, -1);
					}
					else
						$.calendars.picker.changeDay(this, 1);
				}
            },
            nextWeek: {text: 'nextWeekText', status: 'nextWeekStatus', // Next week
                keystroke: {keyCode: 40}, // Down
                enabled: function(inst) {
                    var maxDate = inst.get('maxDate');
                    return (!maxDate || inst.drawDate.newDate().
                        add(inst.get('calendar').daysInWeek(), 'd').compareTo(maxDate) != +1); },
                date: function(inst) { return inst.drawDate.newDate().
                    add(inst.get('calendar').daysInWeek(), 'd'); },
                action: function(inst) { $.calendars.picker.changeDay(
                    this, inst.get('calendar').daysInWeek()); }
            },

			firstDayOfMonth: {text: 'firstDayText', status: 'prevDayStatus', // first day of month
				keystroke: {keyCode: 36}, //  Home
				enabled: function(inst) {
					var target = $(this);
					var minDate = inst.curMinDate();
					console.info(inst.drawDate._day);

					return (!minDate || inst.drawDate.newDate().add(-1, 'd').
						compareTo(minDate) != -1); },
				date: function(inst) {

					return inst.drawDate.newDate().add(0, 'd'); },
				action: function(inst) { $.calendars.picker.changeDay(this, -inst.drawDate._day+1); }
			},
			lastDayOfMonth: {text: 'lastDayText', status: 'prevDayStatus', // last day of month
				keystroke: {keyCode: 35}, //  end

				enabled: function(inst) {
					var target = $(this);
					var minDate = inst.curMinDate();
					return (!minDate || inst.drawDate.newDate().add(-1, 'd').
						compareTo(minDate) != -1); },
				date: function(inst) {
					return inst.drawDate.newDate().add(0, 'd'); },
				action: function(inst) {
					var daysInMonth=$.calendars.picker._checkMinMax(inst.drawDate, inst).daysInMonth(inst.drawDate._year,inst.drawDate._month)
					$.calendars.picker.changeDay(this, daysInMonth-inst.drawDate._day); }
			},
            activateNextCalendar: {text: 'activateNextCalendarText', status: 'activateNextCalendarStatus',
                keystroke: {keyCode: 83,shiftKey:true }, // shift + s
                enabled: function(inst) {
                    return true;
                },
                date: function(inst) {
                },
                action: function(inst) {
                    $('#' + $.multicalendar.calendarIdPrefix + $.multicalendar.activeCalendar ).removeClass('activeCalendar');
                    $.multicalendar.activeCalendar = $.multicalendar.activeCalendar + 1;
                    if(!$('#' + $.multicalendar.calendarIdPrefix + $.multicalendar.activeCalendar ).length){$.multicalendar.activeCalendar = 1; }
                    $('#' + $.multicalendar.calendarIdPrefix + $.multicalendar.activeCalendar ).addClass('activeCalendar');
                }

            },
			showCalendar: {text: 'showCalendarText', status: 'showCalendarStatus',
                keystroke: {keyCode: 120 }, // F9
                enabled: function(inst) {
                    return true;
                },
                date: function(inst) {
                },
                action: function(inst) {
                    $.multicalendar._showCalendar(inst);
					$(inst).attr('readOnly','true');

                }

            }

        }

    );



    $.extend($.calendars.picker,{
	/* Generate the datepicker content for this control.
	   @param  target  (element) the control to affect
	   @param  inst    (object) the current instance settings
	   @return  (jQuery) the datepicker content */
	_generateContent: function(target, inst) {
		var calendar = inst.get('calendar');
		var renderer = inst.get('renderer');
		var monthsToShow = inst.get('monthsToShow');
		monthsToShow = ($.isArray(monthsToShow) ? monthsToShow : [1, monthsToShow]);
		inst.drawDate = this._checkMinMax(
			inst.drawDate || inst.get('defaultDate') || calendar.today(), inst);
		var drawDate = inst.drawDate.newDate().add(-inst.get('monthsOffset'), 'm');
		// Generate months
		var monthRows = '';
		for (var row = 0; row < monthsToShow[0]; row++) {
			var months = '';
			for (var col = 0; col < monthsToShow[1]; col++) {
				months += this._generateMonth(target, inst, drawDate.year(),
					drawDate.month(), calendar, renderer, (row == 0 && col == 0));
				drawDate.add(1, 'm');
			}
			monthRows += this._prepare(renderer.monthRow, inst).replace(/\{months\}/, months);
		}
		var picker = this._prepare(renderer.picker, inst).replace(/\{months\}/, monthRows).
			replace(/\{weekHeader\}/g, this._generateDayHeaders(inst, calendar, renderer)) +
			(!inst.inline ?
			'<iframe src="javascript:void(0);" class="' + this._coverClass + '"></iframe>' : '');
		// Add commands
		var commands = inst.get('commands');
		var asDateFormat = inst.get('commandsAsDateFormat');
		var addCommand = function(type, open, close, name, classes) {
			if (picker.indexOf('{' + type + ':' + name + '}') == -1) {
				return;
			}
			var command = commands[name];
			var date = (asDateFormat ? command.date.apply(target, [inst]) : null);
			picker = picker.replace(new RegExp('\\{' + type + ':' + name + '\\}', 'g'),
				'<' + open +
				(command.status ? ' title="' + inst.get(command.status) + '"' : '') +
				' class="' + renderer.commandClass + ' ' +
				renderer.commandClass + '-' + name + ' ' + classes +
				(command.enabled(inst) ? '' : ' ' + renderer.disabledClass) + '">' +
				(date ? date.formatDate(inst.get(command.text)) : inst.get(command.text)) +
				'</' + close + '>');
		};
		for (var name in commands) {
			addCommand('button', 'button type="button"', 'button', name,
				renderer.commandButtonClass);
			addCommand('link', 'a href="javascript:void(0)"', 'a', name,
				renderer.commandLinkClass);
		}
		picker = $(picker);
		if (monthsToShow[1] > 1) {
			var count = 0;
			$(renderer.monthSelector, picker).each(function() {
				var nth = ++count % monthsToShow[1];
				$(this).addClass(nth == 1 ? 'first' : (nth == 0 ? 'last' : ''));
			});
		}
		// Add calendar behaviour
		var self = this;
		picker.find(renderer.daySelector + ' a').hover(
				function() { $(this).addClass(renderer.highlightedClass); },
				function() {
					(inst.inline ? $(this).parents('.' + self.markerClass) : inst.div).
						find(renderer.daySelector + ' a').
						removeClass(renderer.highlightedClass);
				}).
			click(function() {
				self.selectDate(target, this);
			}).end().
			find('select.' + this._monthYearClass + ':not(.' + this._anyYearClass + ')').change(function() {
				var monthYear = $(this).val().split('/');
				self.showMonth(target, parseInt(monthYear[1], 10), parseInt(monthYear[0], 10));
			}).end().
			find('select.' + this._anyYearClass).click(function() {
				$(this).next('input').css({left: this.offsetLeft, top: this.offsetTop,
					width: this.offsetWidth, height: this.offsetHeight}).show().focus();
			}).end().
			find('input.' + self._monthYearClass).change(function() {
				try {
					var year = parseInt($(this).val(), 10);
					year = (isNaN(year) ? inst.drawDate.year() : year);
					self.showMonth(target, year, inst.drawDate.month(), inst.drawDate.day());
				}
				catch (e) {
					alert(e);
				}
			}).keydown(function(event) {
				if (event.keyCode == 27) { // Escape
					$(event.target).hide();
					inst.target.focus();
				}
			});
		// Add command behaviour
		picker.find('.' + renderer.commandClass).click(function() {
				if (!$(this).hasClass(renderer.disabledClass)) {
					var action = this.className.replace(
						new RegExp('^.*' + renderer.commandClass + '-([^ ]+).*$'), '$1');
					$.calendars.picker.performAction(target, action);
				}
            return false;
			});
		// Add classes
		if (inst.get('isRTL')) {
			picker.addClass(renderer.rtlClass);
		}
		if (monthsToShow[0] * monthsToShow[1] > 1) {
			picker.addClass(renderer.multiClass);
		}
		var pickerClass = inst.get('pickerClass');
		if (pickerClass) {
			picker.addClass(pickerClass);
		}
		// Resize
		$('body').append(picker);
		/*
		var width = 0;
		picker.find(renderer.monthSelector).each(function() {
			width += $(this).outerWidth();
		});
		picker.width(width / monthsToShow[0]);
		*/
		// Pre-show customisation
		var onShow = inst.get('onShow');
		if (onShow) {
			onShow.apply(target, [picker, calendar, inst]);
		}
		return picker;
	},

    _generateMonth : function(target, inst, year, month, calendar, renderer, first) {
		var daysInMonth = calendar.daysInMonth(year, month);
		var monthsToShow = inst.get('monthsToShow');
		monthsToShow = ($.isArray(monthsToShow) ? monthsToShow : [1, monthsToShow]);
		var fixedWeeks = inst.get('fixedWeeks') || (monthsToShow[0] * monthsToShow[1] > 1);
		var firstDay = inst.get('firstDay');
		firstDay = (firstDay == null ? calendar.local.firstDay : firstDay);
		var leadDays = (calendar.dayOfWeek(year, month, calendar.minDay) -
			firstDay + calendar.daysInWeek()) % calendar.daysInWeek();
		var numWeeks = (fixedWeeks ? 6 : Math.ceil((leadDays + daysInMonth) / calendar.daysInWeek()));
		var showOtherMonths = inst.get('showOtherMonths');
		var selectOtherMonths = inst.get('selectOtherMonths') && showOtherMonths;
		var dayStatus = inst.get('dayStatus');
		var minDate = (inst.pickingRange ? inst.selectedDates[0] : inst.get('minDate'));
		var maxDate = inst.get('maxDate');
		var rangeSelect = inst.get('rangeSelect');
		var onDate = inst.get('onDate');
		var showWeeks = renderer.week.indexOf('{weekOfYear}') > -1;
		var calculateWeek = inst.get('calculateWeek');
		var today = $.multicalendar._todaysDate(calendar);//calendar.today();
		var drawDate = calendar.newDate(year, month, calendar.minDay);
		drawDate.add(-leadDays - (fixedWeeks &&
			(drawDate.dayOfWeek() == firstDay || drawDate.daysInMonth() < calendar.daysInWeek())?
			calendar.daysInWeek() : 0), 'd');
		var jd = drawDate.toJD();
		// Generate weeks
		var weeks = '';
		for (var week = 0; week < numWeeks; week++) {
			var weekOfYear = (!showWeeks ? '' : '<span class="jd' + jd + '">' +
				(calculateWeek ? calculateWeek(drawDate) : drawDate.weekOfYear()) + '</span>');
			var days = '';
			for (var day = 0; day < calendar.daysInWeek(); day++) {
				var selected = false;
				if (rangeSelect && inst.selectedDates.length > 0) {
					selected = (drawDate.compareTo(inst.selectedDates[0]) != -1 &&
						drawDate.compareTo(inst.selectedDates[1]) != +1)
				}
				else {
					for (var i = 0; i < inst.selectedDates.length; i++) {
						if (inst.selectedDates[i].compareTo(drawDate) == 0) {
							selected = true;
							break;
						}
					}
				}
				var dateInfo = (!onDate ? {} :
					onDate.apply(target, [drawDate, drawDate.month() == month]));
				var selectable = (selectOtherMonths || drawDate.month() == month) &&
					this._isSelectable(target, drawDate, dateInfo.selectable, minDate, maxDate);
				days += this._prepare(renderer.day, inst).replace(/\{day\}/g,
					(selectable ? '<a href="javascript:void(0)" "onclick="return false;"' : '<span') +
					' class="jd' + jd + ' ' + (dateInfo.dateClass || '') +
					(selected && (selectOtherMonths || drawDate.month() == month) ?
					' ' + renderer.selectedClass : '') +
					(selectable ? ' ' + renderer.defaultClass : '') +
					(drawDate.weekDay() ? '' : ' ' + renderer.weekendClass) +
					(drawDate.month() == month ? '' : ' ' + renderer.otherMonthClass) +
					(drawDate.compareTo(today) == 0 && drawDate.month() == month ?
					' ' + renderer.todayClass : '') +
                    (drawDate.compareTo(inst.drawDate) == 0 && drawDate.month() == month && $.multicalendar._isCalendarShown?
					' ' + renderer.highlightedClass : '') + '"' +
					(dateInfo.title || (dayStatus && selectable) ? ' title="' +
					(dateInfo.title || $.i18n.prop("js.datepicker.selectText") +" "+ drawDate.formatDate(dayStatus)) + '"' : '') + '>' +
					(showOtherMonths || drawDate.month() == month ?
					dateInfo.content || drawDate.day() : '&nbsp;') +
					(selectable ? '</a>' : '</span>'));
				days =  days.replace(/<td>/g,
					'<td class="' +
					(drawDate.compareTo(today) == 0 && drawDate.month() == month ?
					' ' + renderer.todayClass : '') + '">');
				drawDate.add(1, 'd');
				jd++;
			}
			weeks += this._prepare(renderer.week, inst).replace(/\{days\}/g, days).
				replace(/\{weekOfYear\}/g, weekOfYear);
		}
		var monthHeader = this._prepare(renderer.month, inst).match(/\{monthHeader(:[^\}]+)?\}/);
		monthHeader = (monthHeader[0].length <= 13 ? 'MM yyyy' :
			monthHeader[0].substring(13, monthHeader[0].length - 1));
		monthHeader = (first ? this._generateMonthSelection(
			inst, year, month, minDate, maxDate, monthHeader, calendar, renderer) :
			calendar.formatDate(monthHeader, calendar.newDate(year, month, calendar.minDay)));
		var weekHeader = this._prepare(renderer.weekHeader, inst).
			replace(/\{days\}/g, this._generateDayHeaders(inst, calendar, renderer));
		return this._prepare(renderer.month, inst).replace(/\{monthHeader(:[^\}]+)?\}/g, monthHeader).
			replace(/\{weekHeader\}/g, weekHeader).replace(/\{weeks\}/g, weeks);
	},

    keyDownMultipicker : function(event, activeCalendar) {
		var target = activeCalendar;
		var inst = $.data(target, $.calendars.picker.dataName);
		var handled = false;
        var visibleInstance = $.multicalendar._isCalendarShown && $.multicalendar._currentObj && $.multicalendar._currentObj.get(0);

        if (event.keyCode == 9 ) { // Tab - close
	    $.multicalendar._hideCalendar(visibleInstance);
	}
	else if( event.keyCode == 27) { // Esc - close
            $.multicalendar._hideCalendar(visibleInstance);
            handled = true;
        }
        else if (event.keyCode == 13) { // Enter - select
            if(($('.ui-state-default.ui-state-hover').length !== 0)){
                $('.ui-state-default.ui-state-hover').click();
            }else if($('.ui-state-active.ui-state-default').length !== 0 ){
                $('.ui-state-active.ui-state-default').click();
            }else if ($('.ui-state-default.ui-state-highlight') !== 0){
                $('.ui-state-default.ui-state-highlight').click();
            }
            handled = true;
        }
		else if (event.keyCode == 32) { // Space Select date and close.
			$('#multiCalendarContainer .activeCalendar a.ui-state-hover').click();
			handled = true;
		}
        else { // Command keystrokes
            var commands = inst.get('commands');
			handled = true;
            for (var name in commands) {
                var command = commands[name];
                if (command.keystroke.keyCode == event.keyCode &&
                        !!command.keystroke.ctrlKey == !!(event.ctrlKey || event.metaKey) &&
                        !!command.keystroke.altKey == event.altKey &&
                        !!command.keystroke.shiftKey == event.shiftKey) {
                    $.calendars.picker.performAction(target, name);
                    break;
                }
            }
        }

		inst.ctrlKey = ((event.keyCode < 48 && event.keyCode != 32) ||
			event.ctrlKey || event.metaKey);
		if (handled) {
			event.preventDefault();
			event.stopPropagation();
            if($.multicalendar._isCalendarShown && $('.activeCalendar a.ui-state-hover')[0])
                $('#sceenReaderText').html($('.activeCalendar a.ui-state-hover')[0].title);
		}
		return !handled;
	},

	keyPressMultipicker: function(event, activeCalendar) {
		var target = activeCalendar;
		var inst = $.data(target, $.calendars.picker.dataName);
		if (inst && inst.get('constrainInput')) {
			var ch = String.fromCharCode(event.keyCode || event.charCode);
			var allowedChars = $.calendars.picker._allowedChars(inst);
			return (event.metaKey || inst.ctrlKey || ch < ' ' ||
				!allowedChars || allowedChars.indexOf(ch) > -1);
		}
		return true;
	}
    });
})(jQuery);

var process = process || {env: {NODE_ENV: "development"}};
$(document).ready(function() {

    $.calendars.picker.setDefaults({
        renderer:          $.calendars.picker.themeRollerRenderer,
        changeMonth:       true,
        showAnim:          "fadeIn",
        showOptions:       null,
        showSpeed:         500,
        useMouseWheel:     false,
        showOtherMonths:   true,
        selectOtherMonths: true,
        prevJumpText:      "<span class=\"ui-icon ui-icon-circle-triangle-ww\"></span>",
        nextJumpText:      "<span class=\"ui-icon ui-icon-circle-triangle-ee\"></span>",
        closeText:         "<span id='closeId' class=\"ui-icon ui-icon-close\"></span>",
        prevText:          "<span class=\"ui-icon ui-icon-circle-triangle-w\"> </span>",
        nextText:          "<span class=\"ui-icon ui-icon-circle-triangle-e\"> </span>",
        dayStatus:         $.i18n.prop("js.datepicker.tooltipDateFormat"),
        prevStatus:        $.i18n.prop("js.datepicker.prevStatus"),
        nextStatus:        $.i18n.prop("js.datepicker.nextStatus"),
        prevJumpStatus: $.i18n.prop("js.datepicker.prevJumpStatus"),
        nextJumpStatus:$.i18n.prop("js.datepicker.nextJumpStatus")
    });

    var default_calendar=$.i18n.prop("default.calendar");
    var default_calendar1=$.i18n.prop("default.calendar1");
    var default_calendar2=$.i18n.prop("default.calendar2");
    var firstDayOfTheWeek=$.i18n.prop("default.firstDayOfTheWeek");

    var islamicCalendarLocaleProps = {
        monthNames: $.i18n.prop("default.islamic.monthNames"),
		monthNamesShort: $.i18n.prop("default.islamic.monthNamesShort"),
		dayNames: $.i18n.prop("default.islamic.dayNames"),
		dayNamesShort: $.i18n.prop("default.islamic.dayNamesShort"),
        dayNamesMin: $.i18n.prop("default.islamic.dayNamesMin")
    };
    var ummalquraCalendarLocaleProps = {
        monthNames: $.i18n.prop("default.ummalqura.monthNames"),
        monthNamesShort: $.i18n.prop("default.ummalqura.monthNamesShort"),
        dayNames: $.i18n.prop("default.ummalqura.dayNames"),
        dayNamesShort: $.i18n.prop("default.ummalqura.dayNamesShort"),
        dayNamesMin: $.i18n.prop("default.ummalqura.dayNamesMin")
    };

    var gregorianCalendarLocaleProps = {
        monthNames: $.i18n.prop("default.gregorian.monthNames"),
		monthNamesShort: $.i18n.prop("default.gregorian.monthNamesShort"),
		dayNames: $.i18n.prop("default.gregorian.dayNames"),
		dayNamesShort: $.i18n.prop("default.gregorian.dayNamesShort"),
        dayNamesMin: $.i18n.prop("default.gregorian.dayNamesMin")
    };

    var calendarLocaleProps = {islamic: islamicCalendarLocaleProps, ummalqura: ummalquraCalendarLocaleProps, gregorian: gregorianCalendarLocaleProps};
    var timeLocaleProps = {
        ampmNames: [$.i18n.prop('default.time.am'), $.i18n.prop('default.time.pm')],
    	spinnerTexts: [$.i18n.prop('default.time.increment'), $.i18n.prop('default.time.decrement')]
    };

    var dateConverterURL = "dateConverter"
    if($('meta[name=menuBaseURL]').attr("content")){
           dateConverterURL = $('meta[name=menuBaseURL]').attr("content") + '/' + dateConverterURL;
    }

    var converters = {
        gregorianToIslamic: {
            format: {
                url: dateConverterURL,
                nameOfDateParam: 'date',
                extraParams: {
                    calendar: 'islamic-civil',
                    fromDateFormat: 'MM/dd/yyyy',
                    toDateFormat: 'MM/dd/yyyy',
                    toULocale: $.i18n.prop("default.calendar.islamic.ulocale"),
                    fromULocale: $.i18n.prop("default.calendar.gregorian.translation")
                }
            }
        },
        islamicToGregorian: {
            format: {
                url: dateConverterURL,
                nameOfDateParam: 'date',
                extraParams: {
                    calendar: 'islamic-civil',
                    fromDateFormat: 'MM/dd/yyyy',
                    toDateFormat: 'MM/dd/yyyy',
                    toULocale: $.i18n.prop("default.calendar.gregorian.translation"),
                    fromULocale: $.i18n.prop("default.calendar.islamic.ulocale")
                }
            }
        },
        gregorianToUmmalqura: {
            format: {
                url: dateConverterURL,
                nameOfDateParam: 'date',
                extraParams: {
                    calendar: 'islamic-umalqura',
                    fromDateFormat: 'MM/dd/yyyy',
                    toDateFormat: 'MM/dd/yyyy',
                    toULocale: $.i18n.prop("default.calendar.ummalqura.ulocale"),
                    fromULocale: $.i18n.prop("default.calendar.gregorian.translation")
                }
            }
        },

        ummalquraToGregorian: {
            format: {
                url: dateConverterURL,
                nameOfDateParam: 'date',
                extraParams: {
                    calendar: 'islamic-umalqura',
                    fromDateFormat: 'MM/dd/yyyy',
                    toDateFormat: 'MM/dd/yyyy',
                    toULocale: $.i18n.prop("default.calendar.gregorian.translation"),
                    fromULocale: $.i18n.prop("default.calendar.ummalqura.ulocale")
                }
            }
        }

    };

    $.multicalendar.setDefaults({
        defaultCalendar: default_calendar,
        converters: converters,
        defaultDateFormat: 'mm/dd/yyyy',
        displayDateFormat: $.i18n.prop("js.datepicker.dateFormat"),
        calendars:[ default_calendar1, default_calendar2 ],
        isRTL: $.i18n.prop("default.language.direction"),
        calendarLocaleProps: calendarLocaleProps,
        buttonClass: 'calendar-img',
        showOn: 'both',
        firstDayOfTheWeek: firstDayOfTheWeek,
        timeFormat: $.i18n.prop("default.time.format"),
        timeLocaleProps: timeLocaleProps
    });
});
var process = process || {env: {NODE_ENV: "development"}};
﻿/* http://keith-wood.name/calendars.html
   UmmAlQura calendar for jQuery v2.0.2.
   Written by Amro Osama March 2013.
   Modified by Binnooh.com & www.elm.sa - 2014 - Added dates back to 1276 Hijri year.
   Available under the MIT (http://keith-wood.name/licence.html) license. 
   Please attribute the author if you use it. */

(function ($) { // Hide scope, no $ conflict

	/** Implementation of the UmmAlQura or 'saudi' calendar.
		See also <a href="http://en.wikipedia.org/wiki/Islamic_calendar#Saudi_Arabia.27s_Umm_al-Qura_calendar">http://en.wikipedia.org/wiki/Islamic_calendar#Saudi_Arabia.27s_Umm_al-Qura_calendar</a>.
		<a href="http://www.ummulqura.org.sa/About.aspx">http://www.ummulqura.org.sa/About.aspx</a>
		<a href="http://www.staff.science.uu.nl/~gent0113/islam/ummalqura.htm">http://www.staff.science.uu.nl/~gent0113/islam/ummalqura.htm</a>
		@class UmmAlQuraCalendar
		@param [language=''] {string} The language code (default English) for localisation. */
	function UmmAlQuraCalendar(language) {
		this.local = this.regional[language || ''] || this.regional[''];
	}

	UmmAlQuraCalendar.prototype = new $.calendars.baseCalendar;

	$.extend(UmmAlQuraCalendar.prototype, {
		/** The calendar name.
			@memberof UmmAlQuraCalendar */
		name: 'UmmAlQura',
		//jdEpoch: 1948440, // Julian date of start of UmmAlQura epoch: 14 March 1937 CE
		//daysPerMonth: // Days per month in a common year, replaced by a method.
		/** <code>true</code> if has a year zero, <code>false</code> if not.
			@memberof UmmAlQuraCalendar */
		hasYearZero: false,
		/** The minimum month number.
			@memberof UmmAlQuraCalendar */
		minMonth: 1,
		/** The first month in the year.
			@memberof UmmAlQuraCalendar */
		firstMonth: 1,
		/** The minimum day number.
			@memberof UmmAlQuraCalendar */
		minDay: 1,

		/** Localisations for the plugin.
			Entries are objects indexed by the language code ('' being the default US/English).
			Each object has the following attributes.
			@memberof UmmAlQuraCalendar
			@property name {string} The calendar name.
			@property epochs {string[]} The epoch names.
			@property monthNames {string[]} The long names of the months of the year.
			@property monthNamesShort {string[]} The short names of the months of the year.
			@property dayNames {string[]} The long names of the days of the week.
			@property dayNamesShort {string[]} The short names of the days of the week.
			@property dayNamesMin {string[]} The minimal names of the days of the week.
			@property dateFormat {string} The date format for this calendar.
					See the options on <a href="BaseCalendar.html#formatDate"><code>formatDate</code></a> for details.
			@property firstDay {number} The number of the first day of the week, starting at 0.
			@property isRTL {number} <code>true</code> if this localisation reads right-to-left. */
		regional: { // Localisations
			'': {
				name: 'Umm al-Qura',
				epochs: ['BH', 'AH'],
				monthNames: ['Al-Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' Al-Thani', 'Jumada Al-Awwal', 'Jumada Al-Thani',
				'Rajab', 'Sha\'aban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'],
				monthNamesShort: ['Muh', 'Saf', 'Rab1', 'Rab2', 'Jum1', 'Jum2', 'Raj', 'Sha\'', 'Ram', 'Shaw', 'DhuQ', 'DhuH'],
				dayNames: ['Yawm al-Ahad', 'Yawm al-Ithnain', 'Yawm al-Thalāthā’', 'Yawm al-Arba‘ā’', 'Yawm al-Khamīs', 'Yawm al-Jum‘a', 'Yawm al-Sabt'],
				dayNamesMin: ['Ah', 'Ith', 'Th', 'Ar', 'Kh', 'Ju', 'Sa'],
				digits: null,
				dateFormat: 'yyyy/mm/dd',
				firstDay: 6,
				isRTL: true
			}
		},

		/** Determine whether this date is in a leap year.
			@memberof UmmAlQuraCalendar
			@param year {CDate|number} The date to examine or the year to examine.
			@return {boolean} <code>true</code> if this is a leap year, <code>false</code> if not.
			@throws Error if an invalid year or a different calendar used. */
		leapYear: function (year) {
			var date = this._validate(year, this.minMonth, this.minDay, $.calendars.local.invalidYear);
			return (this.daysInYear(date.year()) === 355);
		},

		/** Determine the week of the year for a date.
			@memberof UmmAlQuraCalendar
			@param year {CDate|number} The date to examine or the year to examine.
			@param [month] {number} The month to examine.
			@param [day] {number} The day to examine.
			@return {number} The week of the year.
			@throws Error if an invalid date or a different calendar used. */
		weekOfYear: function (year, month, day) {
			// Find Sunday of this week starting on Sunday
			var checkDate = this.newDate(year, month, day);
			checkDate.add(-checkDate.dayOfWeek(), 'd');
			return Math.floor((checkDate.dayOfYear() - 1) / 7) + 1;
		},

		/** Retrieve the number of days in a year.
			@memberof UmmAlQuraCalendar
			@param year {CDate|number} The date to examine or the year to examine.
			@return {number} The number of days.
			@throws Error if an invalid year or a different calendar used. */
		daysInYear: function (year) {
			var daysCount = 0;
			for (var i = 1; i <= 12; i++) {
				daysCount += this.daysInMonth(year, i);
			}
			return daysCount;
		},

		/** Retrieve the number of days in a month.
			@memberof UmmAlQuraCalendar
			@param year {CDate|number} The date to examine or the year of the month.
			@param [month] {number} The month.
			@return {number} The number of days in this month.
			@throws Error if an invalid month/year or a different calendar used. */
		daysInMonth: function (year, month) {
			var date = this._validate(year, month, this.minDay, $.calendars.local.invalidMonth);
			var mcjdn = date.toJD() - 2400000 + 0.5; // Modified Chronological Julian Day Number (MCJDN)
			// the MCJDN's of the start of the lunations in the Umm al-Qura calendar are stored in the 'ummalqura_dat' array
			var index = 0;
			for (var i = 0; i < ummalqura_dat.length; i++) {
				if (ummalqura_dat[i] > mcjdn) {
					return (ummalqura_dat[index] - ummalqura_dat[index - 1]);
				}
				index++;
			}
			return 30; // Unknown outside
		},

		/** Determine whether this date is a week day.
			@memberof UmmAlQuraCalendar
			@param year {CDate|number} The date to examine or the year to examine.
			@param [month] {number} The month to examine.
			@param [day] {number} The day to examine.
			@return {boolean} <code>true</code> if a week day, <code>false</code> if not.
			@throws Error if an invalid date or a different calendar used. */
		weekDay: function (year, month, day) {
			return this.dayOfWeek(year, month, day) !== 5;
		},

		/** Retrieve the Julian date equivalent for this date,
			i.e. days since January 1, 4713 BCE Greenwich noon.
			@memberof UmmAlQuraCalendar
			@param year {CDate|number} The date to convert or the year to convert.
			@param [month] {number} The month to convert.
			@param [day] {number} The day to convert.
			@return {number} The equivalent Julian date.
			@throws Error if an invalid date or a different calendar used. */
		toJD: function (year, month, day) {
			var date = this._validate(year, month, day, $.calendars.local.invalidDate);
			var index = (12 * (date.year() - 1)) + date.month() - 15292;
			var mcjdn = date.day() + ummalqura_dat[index - 1] - 1;
			return mcjdn + 2400000 - 0.5; // Modified Chronological Julian Day Number (MCJDN)
		},

		/** Create a new date from a Julian date.
			@memberof UmmAlQuraCalendar
			@param jd {number} The Julian date to convert.
			@return {CDate} The equivalent date. */
		fromJD: function (jd) {
			var mcjdn = jd - 2400000 + 0.5; // Modified Chronological Julian Day Number (MCJDN)
			// the MCJDN's of the start of the lunations in the Umm al-Qura calendar 
			// are stored in the 'ummalqura_dat' array
			var index = 0;
			for (var i = 0; i < ummalqura_dat.length; i++) {
				if (ummalqura_dat[i] > mcjdn) break;
				index++;
			}
			var lunation = index + 15292; //UmmAlQura Lunation Number
			var ii = Math.floor((lunation - 1) / 12);
			var year = ii + 1;
			var month = lunation - 12 * ii;
			var day = mcjdn - ummalqura_dat[index - 1] + 1;
			return this.newDate(year, month, day);
		},

		/** Determine whether a date is valid for this calendar.
			@memberof UmmAlQuraCalendar
			@param year {number} The year to examine.
			@param month {number} The month to examine.
			@param day {number} The day to examine.
			@return {boolean} <code>true</code> if a valid date, <code>false</code> if not. */
		isValid: function(year, month, day) {
			var valid = $.calendars.baseCalendar.prototype.isValid.apply(this, arguments);
			if (valid) {
				year = (year.year != null ? year.year : year);
				valid = (year >= 1276 && year <= 1500);
			}
			return valid;
		},

		/** Check that a candidate date is from the same calendar and is valid.
			@memberof UmmAlQuraCalendar
			@private
			@param year {CDate|number} The date to validate or the year to validate.
			@param month {number} The month to validate.
			@param day {number} The day to validate.
			@param error {string} Error message if invalid.
			@throws Error if different calendars used or invalid date. */
		_validate: function(year, month, day, error) {
			var date = $.calendars.baseCalendar.prototype._validate.apply(this, arguments);
			if (date.year < 1276 || date.year > 1500) {
				throw error.replace(/\{0\}/, this.local.name);
			}
			return date;
		}
	});

	// UmmAlQura calendar implementation
	$.calendars.calendars.ummalqura = UmmAlQuraCalendar;

	var ummalqura_dat = [
		20,    50,    79,    109,   138,   168,   197,   227,   256,   286,   315,   345,   374,   404,   433,   463,   492,   522,   551,   581, 
		611,   641,   670,   700,   729,   759,   788,   818,   847,   877,   906,   936,   965,   995,   1024,  1054,  1083,  1113,  1142,  1172,
		1201,  1231,  1260,  1290,  1320,  1350,  1379,  1409,  1438,  1468,  1497,  1527,  1556,  1586,  1615,  1645,  1674,  1704,  1733,  1763,
		1792,  1822,  1851,  1881,  1910,  1940,  1969,  1999,  2028,  2058,  2087,  2117,  2146,  2176,  2205,  2235,  2264,  2294,  2323,  2353,
		2383,  2413,  2442,  2472,  2501,  2531,  2560,  2590,  2619,  2649,  2678,  2708,  2737,  2767,  2796,  2826,  2855,  2885,  2914,  2944,
		2973,  3003,  3032,  3062,  3091,  3121,  3150,  3180,  3209,  3239,  3268,  3298,  3327,  3357,  3386,  3416,  3446,  3476,  3505,  3535,
		3564,  3594,  3623,  3653,  3682,  3712,  3741,  3771,  3800,  3830,  3859,  3889,  3918,  3948,  3977,  4007,  4036,  4066,  4095,  4125,
		4155,  4185,  4214,  4244,  4273,  4303,  4332,  4362,  4391,  4421,  4450,  4480,  4509,  4539,  4568,  4598,  4627,  4657,  4686,  4716,
		4745,  4775,  4804,  4834,  4863,  4893,  4922,  4952,  4981,  5011,  5040,  5070,  5099,  5129,  5158,  5188,  5218,  5248,  5277,  5307,
		5336,  5366,  5395,  5425,  5454,  5484,  5513,  5543,  5572,  5602,  5631,  5661,  5690,  5720,  5749,  5779,  5808,  5838,  5867,  5897,
		5926,  5956,  5985,  6015,  6044,  6074,  6103,  6133,  6162,  6192,  6221,  6251,  6281,  6311,  6340,  6370,  6399,  6429,  6458,  6488,
		6517,  6547,  6576,  6606,  6635,  6665,  6694,  6724,  6753,  6783,  6812,  6842,  6871,  6901,  6930,  6960,  6989,  7019,  7048,  7078,
		7107,  7137,  7166,  7196,  7225,  7255,  7284,  7314,  7344,  7374,  7403,  7433,  7462,  7492,  7521,  7551,  7580,  7610,  7639,  7669,
		7698,  7728,  7757,  7787,  7816,  7846,  7875,  7905,  7934,  7964,  7993,  8023,  8053,  8083,  8112,  8142,  8171,  8201,  8230,  8260,
		8289,  8319,  8348,  8378,  8407,  8437,  8466,  8496,  8525,  8555,  8584,  8614,  8643,  8673,  8702,  8732,  8761,  8791,  8821,  8850,
		8880,  8909,  8938,  8968,  8997,  9027,  9056,  9086,  9115,  9145,  9175,  9205,  9234,  9264,  9293,  9322,  9352,  9381,  9410,  9440,
		9470,  9499,  9529,  9559,  9589,  9618,  9648,  9677,  9706,  9736,  9765,  9794,  9824,  9853,  9883,  9913,  9943,  9972,  10002, 10032,
		10061, 10090, 10120, 10149, 10178, 10208, 10237, 10267, 10297, 10326, 10356, 10386, 10415, 10445, 10474, 10504, 10533, 10562, 10592, 10621,
		10651, 10680, 10710, 10740, 10770, 10799, 10829, 10858, 10888, 10917, 10947, 10976, 11005, 11035, 11064, 11094, 11124, 11153, 11183, 11213,
		11242, 11272, 11301, 11331, 11360, 11389, 11419, 11448, 11478, 11507, 11537, 11567, 11596, 11626, 11655, 11685, 11715, 11744, 11774, 11803,
		11832, 11862, 11891, 11921, 11950, 11980, 12010, 12039, 12069, 12099, 12128, 12158, 12187, 12216, 12246, 12275, 12304, 12334, 12364, 12393,
		12423, 12453, 12483, 12512, 12542, 12571, 12600, 12630, 12659, 12688, 12718, 12747, 12777, 12807, 12837, 12866, 12896, 12926, 12955, 12984,
		13014, 13043, 13072, 13102, 13131, 13161, 13191, 13220, 13250, 13280, 13310, 13339, 13368, 13398, 13427, 13456, 13486, 13515, 13545, 13574,
		13604, 13634, 13664, 13693, 13723, 13752, 13782, 13811, 13840, 13870, 13899, 13929, 13958, 13988, 14018, 14047, 14077, 14107, 14136, 14166,
		14195, 14224, 14254, 14283, 14313, 14342, 14372, 14401, 14431, 14461, 14490, 14520, 14550, 14579, 14609, 14638, 14667, 14697, 14726, 14756,
		14785, 14815, 14844, 14874, 14904, 14933, 14963, 14993, 15021, 15051, 15081, 15110, 15140, 15169, 15199, 15228, 15258, 15287, 15317, 15347,
		15377, 15406, 15436, 15465, 15494, 15524, 15553, 15582, 15612, 15641, 15671, 15701, 15731, 15760, 15790, 15820, 15849, 15878, 15908, 15937,
		15966, 15996, 16025, 16055, 16085, 16114, 16144, 16174, 16204, 16233, 16262, 16292, 16321, 16350, 16380, 16409, 16439, 16468, 16498, 16528,
		16558, 16587, 16617, 16646, 16676, 16705, 16734, 16764, 16793, 16823, 16852, 16882, 16912, 16941, 16971, 17001, 17030, 17060, 17089, 17118,
		17148, 17177, 17207, 17236, 17266, 17295, 17325, 17355, 17384, 17414, 17444, 17473, 17502, 17532, 17561, 17591, 17620, 17650, 17679, 17709,
		17738, 17768, 17798, 17827, 17857, 17886, 17916, 17945, 17975, 18004, 18034, 18063, 18093, 18122, 18152, 18181, 18211, 18241, 18270, 18300,
		18330, 18359, 18388, 18418, 18447, 18476, 18506, 18535, 18565, 18595, 18625, 18654, 18684, 18714, 18743, 18772, 18802, 18831, 18860, 18890,
		18919, 18949, 18979, 19008, 19038, 19068, 19098, 19127, 19156, 19186, 19215, 19244, 19274, 19303, 19333, 19362, 19392, 19422, 19452, 19481,
		19511, 19540, 19570, 19599, 19628, 19658, 19687, 19717, 19746, 19776, 19806, 19836, 19865, 19895, 19924, 19954, 19983, 20012, 20042, 20071,
		20101, 20130, 20160, 20190, 20219, 20249, 20279, 20308, 20338, 20367, 20396, 20426, 20455, 20485, 20514, 20544, 20573, 20603, 20633, 20662,
		20692, 20721, 20751, 20780, 20810, 20839, 20869, 20898, 20928, 20957, 20987, 21016, 21046, 21076, 21105, 21135, 21164, 21194, 21223, 21253,
		21282, 21312, 21341, 21371, 21400, 21430, 21459, 21489, 21519, 21548, 21578, 21607, 21637, 21666, 21696, 21725, 21754, 21784, 21813, 21843,
		21873, 21902, 21932, 21962, 21991, 22021, 22050, 22080, 22109, 22138, 22168, 22197, 22227, 22256, 22286, 22316, 22346, 22375, 22405, 22434,
		22464, 22493, 22522, 22552, 22581, 22611, 22640, 22670, 22700, 22730, 22759, 22789, 22818, 22848, 22877, 22906, 22936, 22965, 22994, 23024,
		23054, 23083, 23113, 23143, 23173, 23202, 23232, 23261, 23290, 23320, 23349, 23379, 23408, 23438, 23467, 23497, 23527, 23556, 23586, 23616,
		23645, 23674, 23704, 23733, 23763, 23792, 23822, 23851, 23881, 23910, 23940, 23970, 23999, 24029, 24058, 24088, 24117, 24147, 24176, 24206,
		24235, 24265, 24294, 24324, 24353, 24383, 24413, 24442, 24472, 24501, 24531, 24560, 24590, 24619, 24648, 24678, 24707, 24737, 24767, 24796,
		24826, 24856, 24885, 24915, 24944, 24974, 25003, 25032, 25062, 25091, 25121, 25150, 25180, 25210, 25240, 25269, 25299, 25328, 25358, 25387,
		25416, 25446, 25475, 25505, 25534, 25564, 25594, 25624, 25653, 25683, 25712, 25742, 25771, 25800, 25830, 25859, 25888, 25918, 25948, 25977,
		26007, 26037, 26067, 26096, 26126, 26155, 26184, 26214, 26243, 26272, 26302, 26332, 26361, 26391, 26421, 26451, 26480, 26510, 26539, 26568,
		26598, 26627, 26656, 26686, 26715, 26745, 26775, 26805, 26834, 26864, 26893, 26923, 26952, 26982, 27011, 27041, 27070, 27099, 27129, 27159,
		27188, 27218, 27248, 27277, 27307, 27336, 27366, 27395, 27425, 27454, 27484, 27513, 27542, 27572, 27602, 27631, 27661, 27691, 27720, 27750,
		27779, 27809, 27838, 27868, 27897, 27926, 27956, 27985, 28015, 28045, 28074, 28104, 28134, 28163, 28193, 28222, 28252, 28281, 28310, 28340,
		28369, 28399, 28428, 28458, 28488, 28517, 28547, 28577,
		// From 1356
		28607, 28636, 28665, 28695, 28724, 28754, 28783, 28813, 28843, 28872, 28901, 28931, 28960, 28990, 29019, 29049, 29078, 29108, 29137, 29167,
		29196, 29226, 29255, 29285, 29315, 29345, 29375, 29404, 29434, 29463, 29492, 29522, 29551, 29580, 29610, 29640, 29669, 29699, 29729, 29759,
		29788, 29818, 29847, 29876, 29906, 29935, 29964, 29994, 30023, 30053, 30082, 30112, 30141, 30171, 30200, 30230, 30259, 30289, 30318, 30348,
		30378, 30408, 30437, 30467, 30496, 30526, 30555, 30585, 30614, 30644, 30673, 30703, 30732, 30762, 30791, 30821, 30850, 30880, 30909, 30939,
		30968, 30998, 31027, 31057, 31086, 31116, 31145, 31175, 31204, 31234, 31263, 31293, 31322, 31352, 31381, 31411, 31441, 31471, 31500, 31530,
		31559, 31589, 31618, 31648, 31676, 31706, 31736, 31766, 31795, 31825, 31854, 31884, 31913, 31943, 31972, 32002, 32031, 32061, 32090, 32120,
		32150, 32180, 32209, 32239, 32268, 32298, 32327, 32357, 32386, 32416, 32445, 32475, 32504, 32534, 32563, 32593, 32622, 32652, 32681, 32711,
		32740, 32770, 32799, 32829, 32858, 32888, 32917, 32947, 32976, 33006, 33035, 33065, 33094, 33124, 33153, 33183, 33213, 33243, 33272, 33302,
		33331, 33361, 33390, 33420, 33450, 33479, 33509, 33539, 33568, 33598, 33627, 33657, 33686, 33716, 33745, 33775, 33804, 33834, 33863, 33893,
		33922, 33952, 33981, 34011, 34040, 34069, 34099, 34128, 34158, 34187, 34217, 34247, 34277, 34306, 34336, 34365, 34395, 34424, 34454, 34483,
		34512, 34542, 34571, 34601, 34631, 34660, 34690, 34719, 34749, 34778, 34808, 34837, 34867, 34896, 34926, 34955, 34985, 35015, 35044, 35074,
		35103, 35133, 35162, 35192, 35222, 35251, 35280, 35310, 35340, 35370, 35399, 35429, 35458, 35488, 35517, 35547, 35576, 35605, 35635, 35665,
		35694, 35723, 35753, 35782, 35811, 35841, 35871, 35901, 35930, 35960, 35989, 36019, 36048, 36078, 36107, 36136, 36166, 36195, 36225, 36254,
		36284, 36314, 36343, 36373, 36403, 36433, 36462, 36492, 36521, 36551, 36580, 36610, 36639, 36669, 36698, 36728, 36757, 36786, 36816, 36845,
		36875, 36904, 36934, 36963, 36993, 37022, 37052, 37081, 37111, 37141, 37170, 37200, 37229, 37259, 37288, 37318, 37347, 37377, 37406, 37436,
		37465, 37495, 37524, 37554, 37584, 37613, 37643, 37672, 37701, 37731, 37760, 37790, 37819, 37849, 37878, 37908, 37938, 37967, 37997, 38027,
		38056, 38085, 38115, 38144, 38174, 38203, 38233, 38262, 38292, 38322, 38351, 38381, 38410, 38440, 38469, 38499, 38528, 38558, 38587, 38617,
		38646, 38676, 38705, 38735, 38764, 38794, 38823, 38853, 38882, 38912, 38941, 38971, 39001, 39030, 39059, 39089, 39118, 39148, 39178, 39208,
		39237, 39267, 39297, 39326, 39355, 39385, 39414, 39444, 39473, 39503, 39532, 39562, 39592, 39621, 39650, 39680, 39709, 39739, 39768, 39798,
		39827, 39857, 39886, 39916, 39946, 39975, 40005, 40035, 40064, 40094, 40123, 40153, 40182, 40212, 40241, 40271, 40300, 40330, 40359, 40389,
		40418, 40448, 40477, 40507, 40536, 40566, 40595, 40625, 40655, 40685, 40714, 40744, 40773, 40803, 40832, 40862, 40892, 40921, 40951, 40980,
		41009, 41039, 41068, 41098, 41127, 41157, 41186, 41216, 41245, 41275, 41304, 41334, 41364, 41393, 41422, 41452, 41481, 41511, 41540, 41570,
		41599, 41629, 41658, 41688, 41718, 41748, 41777, 41807, 41836, 41865, 41894, 41924, 41953, 41983, 42012, 42042, 42072, 42102, 42131, 42161,
		42190, 42220, 42249, 42279, 42308, 42337, 42367, 42397, 42426, 42456, 42485, 42515, 42545, 42574, 42604, 42633, 42662, 42692, 42721, 42751,
		42780, 42810, 42839, 42869, 42899, 42929, 42958, 42988, 43017, 43046, 43076, 43105, 43135, 43164, 43194, 43223, 43253, 43283, 43312, 43342,
		43371, 43401, 43430, 43460, 43489, 43519, 43548, 43578, 43607, 43637, 43666, 43696, 43726, 43755, 43785, 43814, 43844, 43873, 43903, 43932,
		43962, 43991, 44021, 44050, 44080, 44109, 44139, 44169, 44198, 44228, 44258, 44287, 44317, 44346, 44375, 44405, 44434, 44464, 44493, 44523,
		44553, 44582, 44612, 44641, 44671, 44700, 44730, 44759, 44788, 44818, 44847, 44877, 44906, 44936, 44966, 44996, 45025, 45055, 45084, 45114,
		45143, 45172, 45202, 45231, 45261, 45290, 45320, 45350, 45380, 45409, 45439, 45468, 45498, 45527, 45556, 45586, 45615, 45644, 45674, 45704,
		45733, 45763, 45793, 45823, 45852, 45882, 45911, 45940, 45970, 45999, 46028, 46058, 46088, 46117, 46147, 46177, 46206, 46236, 46265, 46295,
		46324, 46354, 46383, 46413, 46442, 46472, 46501, 46531, 46560, 46590, 46620, 46649, 46679, 46708, 46738, 46767, 46797, 46826, 46856, 46885,
		46915, 46944, 46974, 47003, 47033, 47063, 47092, 47122, 47151, 47181, 47210, 47240, 47269, 47298, 47328, 47357, 47387, 47417, 47446, 47476,
		47506, 47535, 47565, 47594, 47624, 47653, 47682, 47712, 47741, 47771, 47800, 47830, 47860, 47890, 47919, 47949, 47978, 48008, 48037, 48066,
		48096, 48125, 48155, 48184, 48214, 48244, 48273, 48303, 48333, 48362, 48392, 48421, 48450, 48480, 48509, 48538, 48568, 48598, 48627, 48657,
		48687, 48717, 48746, 48776, 48805, 48834, 48864, 48893, 48922, 48952, 48982, 49011, 49041, 49071, 49100, 49130, 49160, 49189, 49218, 49248,
		49277, 49306, 49336, 49365, 49395, 49425, 49455, 49484, 49514, 49543, 49573, 49602, 49632, 49661, 49690, 49720, 49749, 49779, 49809, 49838,
		49868, 49898, 49927, 49957, 49986, 50016, 50045, 50075, 50104, 50133, 50163, 50192, 50222, 50252, 50281, 50311, 50340, 50370, 50400, 50429,
		50459, 50488, 50518, 50547, 50576, 50606, 50635, 50665, 50694, 50724, 50754, 50784, 50813, 50843, 50872, 50902, 50931, 50960, 50990, 51019,
		51049, 51078, 51108, 51138, 51167, 51197, 51227, 51256, 51286, 51315, 51345, 51374, 51403, 51433, 51462, 51492, 51522, 51552, 51582, 51611,
		51641, 51670, 51699, 51729, 51758, 51787, 51816, 51846, 51876, 51906, 51936, 51965, 51995, 52025, 52054, 52083, 52113, 52142, 52171, 52200,
		52230, 52260, 52290, 52319, 52349, 52379, 52408, 52438, 52467, 52497, 52526, 52555, 52585, 52614, 52644, 52673, 52703, 52733, 52762, 52792,
		52822, 52851, 52881, 52910, 52939, 52969, 52998, 53028, 53057, 53087, 53116, 53146, 53176, 53205, 53235, 53264, 53294, 53324, 53353, 53383,
		53412, 53441, 53471, 53500, 53530, 53559, 53589, 53619, 53648, 53678, 53708, 53737, 53767, 53796, 53825, 53855, 53884, 53913, 53943, 53973,
		54003, 54032, 54062, 54092, 54121, 54151, 54180, 54209, 54239, 54268, 54297, 54327, 54357, 54387, 54416, 54446, 54476, 54505, 54535, 54564,
		54593, 54623, 54652, 54681, 54711, 54741, 54770, 54800, 54830, 54859, 54889, 54919, 54948, 54977, 55007, 55036, 55066, 55095, 55125, 55154,
		55184, 55213, 55243, 55273, 55302, 55332, 55361, 55391, 55420, 55450, 55479, 55508, 55538, 55567, 55597, 55627, 55657, 55686, 55716, 55745,
		55775, 55804, 55834, 55863, 55892, 55922, 55951, 55981, 56011, 56040, 56070, 56100, 56129, 56159, 56188, 56218, 56247, 56276, 56306, 56335,
		56365, 56394, 56424, 56454, 56483, 56513, 56543, 56572, 56601, 56631, 56660, 56690, 56719, 56749, 56778, 56808, 56837, 56867, 56897, 56926,
		56956, 56985, 57015, 57044, 57074, 57103, 57133, 57162, 57192, 57221, 57251, 57280, 57310, 57340, 57369, 57399, 57429, 57458, 57487, 57517,
		57546, 57576, 57605, 57634, 57664, 57694, 57723, 57753, 57783, 57813, 57842, 57871, 57901, 57930, 57959, 57989, 58018, 58048, 58077, 58107,
		58137, 58167, 58196, 58226, 58255, 58285, 58314, 58343, 58373, 58402, 58432, 58461, 58491, 58521, 58551, 58580, 58610, 58639, 58669, 58698,
		58727, 58757, 58786, 58816, 58845, 58875, 58905, 58934, 58964, 58994, 59023, 59053, 59082, 59111, 59141, 59170, 59200, 59229, 59259, 59288,
		59318, 59348, 59377, 59407, 59436, 59466, 59495, 59525, 59554, 59584, 59613, 59643, 59672, 59702, 59731, 59761, 59791, 59820, 59850, 59879,
		59909, 59939, 59968, 59997, 60027, 60056, 60086, 60115, 60145, 60174, 60204, 60234, 60264, 60293, 60323, 60352, 60381, 60411, 60440, 60469,
		60499, 60528, 60558, 60588, 60618, 60648, 60677, 60707, 60736, 60765, 60795, 60824, 60853, 60883, 60912, 60942, 60972, 61002, 61031, 61061,
		61090, 61120, 61149, 61179, 61208, 61237, 61267, 61296, 61326, 61356, 61385, 61415, 61445, 61474, 61504, 61533, 61563, 61592, 61621, 61651,
		61680, 61710, 61739, 61769, 61799, 61828, 61858, 61888, 61917, 61947, 61976, 62006, 62035, 62064, 62094, 62123, 62153, 62182, 62212, 62242,
		62271, 62301, 62331, 62360, 62390, 62419, 62448, 62478, 62507, 62537, 62566, 62596, 62625, 62655, 62685, 62715, 62744, 62774, 62803, 62832,
		62862, 62891, 62921, 62950, 62980, 63009, 63039, 63069, 63099, 63128, 63157, 63187, 63216, 63246, 63275, 63305, 63334, 63363, 63393, 63423,
		63453, 63482, 63512, 63541, 63571, 63600, 63630, 63659, 63689, 63718, 63747, 63777, 63807, 63836, 63866, 63895, 63925, 63955, 63984, 64014,
		64043, 64073, 64102, 64131, 64161, 64190, 64220, 64249, 64279, 64309, 64339, 64368, 64398, 64427, 64457, 64486, 64515, 64545, 64574, 64603,
		64633, 64663, 64692, 64722, 64752, 64782, 64811, 64841, 64870, 64899, 64929, 64958, 64987, 65017, 65047, 65076, 65106, 65136, 65166, 65195,
		65225, 65254, 65283, 65313, 65342, 65371, 65401, 65431, 65460, 65490, 65520, 65549, 65579, 65608, 65638, 65667, 65697, 65726, 65755, 65785,
		65815, 65844, 65874, 65903, 65933, 65963, 65992, 66022, 66051, 66081, 66110, 66140, 66169, 66199, 66228, 66258, 66287, 66317, 66346, 66376,
		66405, 66435, 66465, 66494, 66524, 66553, 66583, 66612, 66641, 66671, 66700, 66730, 66760, 66789, 66819, 66849, 66878, 66908, 66937, 66967,
		66996, 67025, 67055, 67084, 67114, 67143, 67173, 67203, 67233, 67262, 67292, 67321, 67351, 67380, 67409, 67439, 67468, 67497, 67527, 67557,
		67587, 67617, 67646, 67676, 67705, 67735, 67764, 67793, 67823, 67852, 67882, 67911, 67941, 67971, 68000, 68030, 68060, 68089, 68119, 68148,
		68177, 68207, 68236, 68266, 68295, 68325, 68354, 68384, 68414, 68443, 68473, 68502, 68532, 68561, 68591, 68620, 68650, 68679, 68708, 68738,
		68768, 68797, 68827, 68857, 68886, 68916, 68946, 68975, 69004, 69034, 69063, 69092, 69122, 69152, 69181, 69211, 69240, 69270, 69300, 69330,
		69359, 69388, 69418, 69447, 69476, 69506, 69535, 69565, 69595, 69624, 69654, 69684, 69713, 69743, 69772, 69802, 69831, 69861, 69890, 69919,
		69949, 69978, 70008, 70038, 70067, 70097, 70126, 70156, 70186, 70215, 70245, 70274, 70303, 70333, 70362, 70392, 70421, 70451, 70481, 70510,
		70540, 70570, 70599, 70629, 70658, 70687, 70717, 70746, 70776, 70805, 70835, 70864, 70894, 70924, 70954, 70983, 71013, 71042, 71071, 71101,
		71130, 71159, 71189, 71218, 71248, 71278, 71308, 71337, 71367, 71397, 71426, 71455, 71485, 71514, 71543, 71573, 71602, 71632, 71662, 71691,
		71721, 71751, 71781, 71810, 71839, 71869, 71898, 71927, 71957, 71986, 72016, 72046, 72075, 72105, 72135, 72164, 72194, 72223, 72253, 72282,
		72311, 72341, 72370, 72400, 72429, 72459, 72489, 72518, 72548, 72577, 72607, 72637, 72666, 72695, 72725, 72754, 72784, 72813, 72843, 72872,
		72902, 72931, 72961, 72991, 73020, 73050, 73080, 73109, 73139, 73168, 73197, 73227, 73256, 73286, 73315, 73345, 73375, 73404, 73434, 73464,
		73493, 73523, 73552, 73581, 73611, 73640, 73669, 73699, 73729, 73758, 73788, 73818, 73848, 73877, 73907, 73936, 73965, 73995, 74024, 74053,
		74083, 74113, 74142, 74172, 74202, 74231, 74261, 74291, 74320, 74349, 74379, 74408, 74437, 74467, 74497, 74526, 74556, 74586, 74615, 74645,
		74675, 74704, 74733, 74763, 74792, 74822, 74851, 74881, 74910, 74940, 74969, 74999, 75029, 75058, 75088, 75117, 75147, 75176, 75206, 75235,
		75264, 75294, 75323, 75353, 75383, 75412, 75442, 75472, 75501, 75531, 75560, 75590, 75619, 75648, 75678, 75707, 75737, 75766, 75796, 75826,
		75856, 75885, 75915, 75944, 75974, 76003, 76032, 76062, 76091, 76121, 76150, 76180, 76210, 76239, 76269, 76299, 76328, 76358, 76387, 76416,
		76446, 76475, 76505, 76534, 76564, 76593, 76623, 76653, 76682, 76712, 76741, 76771, 76801, 76830, 76859, 76889, 76918, 76948, 76977, 77007,
		77036, 77066, 77096, 77125, 77155, 77185, 77214, 77243, 77273, 77302, 77332, 77361, 77390, 77420, 77450, 77479, 77509, 77539, 77569, 77598,
		77627, 77657, 77686, 77715, 77745, 77774, 77804, 77833, 77863, 77893, 77923, 77952, 77982, 78011, 78041, 78070, 78099, 78129, 78158, 78188,
		78217, 78247, 78277, 78307, 78336, 78366, 78395, 78425, 78454, 78483, 78513, 78542, 78572, 78601, 78631, 78661, 78690, 78720, 78750, 78779,
		78808, 78838, 78867, 78897, 78926, 78956, 78985, 79015, 79044, 79074, 79104, 79133, 79163, 79192, 79222, 79251, 79281, 79310, 79340, 79369,
		79399, 79428, 79458, 79487, 79517, 79546, 79576, 79606, 79635, 79665, 79695, 79724, 79753, 79783, 79812, 79841, 79871, 79900, 79930, 79960,
		79990];

})(jQuery);

var process = process || {env: {NODE_ENV: "development"}};
/*!
 * Bootstrap v3.0.2 by @fat and @mdo
 * Copyright 2013 Twitter, Inc.
 * Licensed under http://www.apache.org/licenses/LICENSE-2.0
 *
 * Designed and built with all the love in the world by @mdo and @fat.
 */

if (typeof jQuery === "undefined") { throw new Error("Bootstrap requires jQuery") }

/* ========================================================================
 * Bootstrap: transition.js v3.0.2
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd'
    , 'MozTransition'    : 'transitionend'
    , 'OTransition'      : 'oTransitionEnd otransitionend'
    , 'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.0.2
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent.trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one($.support.transition.end, removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  var old = $.fn.alert

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.0.2
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, Button.DEFAULTS, options)
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $el.addClass(d).attr(d, d) :
        $el.removeClass(d).removeAttr(d);
    }, 0)
  }

  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
        .prop('checked', !this.$element.hasClass('active'))
        .trigger('change')
      if ($input.prop('type') === 'radio') $parent.find('.active').removeClass('active')
    }

    this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
    e.preventDefault()
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.0.2
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.DEFAULTS = {
    interval: 5000
  , pause: 'hover'
  , wrap: true
  }

  Carousel.prototype.cycle =  function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getActiveIndex = function () {
    this.$active = this.$element.find('.item.active')
    this.$items  = this.$active.parent().children()

    return this.$items.index(this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getActiveIndex()

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition.end) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    this.sliding = true

    isCycling && this.pause()

    var e = $.Event('slide.bs.carousel', { relatedTarget: $next[0], direction: direction })

    if ($next.hasClass('active')) return

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      this.$element.one('slid', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
        $nextIndicator && $nextIndicator.addClass('active')
      })
    }

    if ($.support.transition && this.$element.hasClass('slide')) {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
        .emulateTransitionEnd(600)
    } else {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger('slid')
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this), href
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    $target.carousel(options)

    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      $carousel.carousel($carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.0.2
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      actives.collapse('hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')
      [dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('in')
        [dimension]('auto')
      this.transitioning = 0
      this.$element.trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
      [dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element
      [dimension](this.$element[dimension]())
      [0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    $target.collapse(option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.0.2
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle=dropdown]'
  var Dropdown = function (element) {
    var $el = $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      $parent.trigger(e = $.Event('show.bs.dropdown'))

      if (e.isDefaultPrevented()) return

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown')

      $this.focus()
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).focus()
      return $this.click()
    }

    var $items = $('[role=menu] li:not(.divider):visible a', $parent)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index=0

    $items.eq(index).focus()
  }

  function clearMenus() {
    $(backdrop).remove()
    $(toggle).each(function (e) {
      var $parent = getParent($(this))
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown'))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown')
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('dropdown')

      if (!data) $this.data('dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.0.2
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options   = options
    this.$element  = $(element)
    this.$backdrop =
    this.isShown   = null

    if (this.options.remote) this.$element.load(this.options.remote)
  }

  Modal.DEFAULTS = {
      backdrop: true
    , keyboard: true
    , show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.$element.on('click.dismiss.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element.show()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one($.support.transition.end, function () {
            that.$element.focus().trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that    = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click.dismiss.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade')?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  var old = $.fn.modal

  $.fn.modal = function (option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    $target
      .modal(option, this)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  $(document)
    .on('show.bs.modal',  '.modal', function () { $(document.body).addClass('modal-open') })
    .on('hidden.bs.modal', '.modal', function () { $(document.body).removeClass('modal-open') })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.0.2
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.DEFAULTS = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover focus'
  , title: ''
  , delay: 0
  , html: false
  , container: false
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled  = true
    this.type     = type
    this.$element = $(element)
    this.options  = this.getOptions(options)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay
      , hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.'+ this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var $parent = this.$element.parent()

        var orgPlacement = placement
        var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
        var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
        var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
        var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

        placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)
      this.$element.trigger('shown.bs.' + this.type)
    }
  }

  Tooltip.prototype.applyPlacement = function(offset, placement) {
    var replace
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    $tip
      .offset(offset)
      .addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      replace = true
      offset.top = offset.top + height - actualHeight
    }

    if (/bottom|top/.test(placement)) {
      var delta = 0

      if (offset.left < 0) {
        delta       = offset.left * -2
        offset.left = 0

        $tip.offset(offset)

        actualWidth  = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight
      }

      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top')
    }

    if (replace) $tip.offset(offset)
  }

  Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one($.support.transition.end, complete)
        .emulateTransitionEnd(150) :
      complete()

    this.$element.trigger('hidden.bs.' + this.type)

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function () {
    var el = this.$element[0]
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
      width: el.offsetWidth
    , height: el.offsetHeight
    }, this.$element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template)
  }

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.0.2
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.DEFAULTS = $.extend({} , $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.arrow')
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.0.2
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var href
    var process  = $.proxy(this.process, this)

    this.$element       = $(element).is('body') ? $(window) : $(element)
    this.$body          = $('body')
    this.$scrollElement = this.$element.on('scroll.bs.scroll-spy.data-api', process)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target
      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.offsets        = $([])
    this.targets        = $([])
    this.activeTarget   = null

    this.refresh()
    this.process()
  }

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = this.$element[0] == window ? 'offset' : 'position'

    this.offsets = $([])
    this.targets = $([])

    var self     = this
    var $targets = this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#\w/.test(href) && $(href)

        return ($href
          && $href.length
          && [[ $href[offsetMethod]().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
    var maxScroll    = scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets.last()[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate( targets[i] )
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parents('.active')
      .removeClass('active')

    var selector = this.selector
      + '[data-target="' + target + '"],'
      + this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length)  {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  var old = $.fn.scrollspy

  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      $spy.scrollspy($spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.0.2
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab'
      , relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.0.2
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)
    this.$window = $(window)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element = $(element)
    this.affixed  =
    this.unpin    = null

    this.checkPosition()
  }

  Affix.RESET = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$window.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top()
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom()

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin) this.$element.css('top', '')

    this.affixed = affix
    this.unpin   = affix == 'bottom' ? position.top - scrollTop : null

    this.$element.removeClass(Affix.RESET).addClass('affix' + (affix ? '-' + affix : ''))

    if (affix == 'bottom') {
      this.$element.offset({ top: document.body.offsetHeight - offsetBottom - this.$element.height() })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  var old = $.fn.affix

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      $spy.affix(data)
    })
  })

}(jQuery);

var process = process || {env: {NODE_ENV: "development"}};
//= require bootstrap/js/bootstrap.js
var process = process || {env: {NODE_ENV: "development"}};
//= require calendars/jquery.calendars.js
//= require calendars/jquery.calendars.plus.js
//= require calendars/jquery.calendars.picker.js
//= require calendars/jquery.calendars.picker.ext.js
//= require calendars/jquery.calendars.islamic.js
//= require time/jquery.timeentry.js
//= require jquery.multi.calendars.picker.js
//= require jquery.jeditable.multi.datepicker.js
//= require jquery.multi.calendars.picker.ext.js
//= require multi.calendar.init.js
//= require calendars/jquery.calendars.ummalqura.js
//= require modules/bootstrap-mf.js
