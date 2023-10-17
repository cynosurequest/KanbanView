import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProjectAssignmentRecords from '@salesforce/apex/ProjectTimesheet.getProjectAssignmentRecords';
import getProjectTimeSheetRecords from '@salesforce/apex/ProjectTimesheet.getProjectTimeSheetRecords';
import insertProjectTimesheet from '@salesforce/apex/ProjectTimesheet.insertProjectTimesheet';
import { refreshApex } from '@salesforce/apex';

export default class TabContainer extends LightningElement {
  @track weeks = [];
  visibleTabs = 4;
  visibleWeeks = [];
  scrollOffset = 0;
  selectedWeek = null;
  projectAssignments = [];
  startDate
  endDate;
  activeTabValue
  //days = [];
  projectTimesheet = [];
  daysArray;
  timesheetRecords;
  inputMap = new Map();
  currentWeekNumber

  // values = [{
  //   projectId : this.projectTimesheet.Project__r,
  //   dayOfWeek :this.selectedWeek.days,
  //   projectName :this.projectTimesheet.Project__r.Name
  // }]
  tabColumns = [
    {
      label: 'Week Number',
      fieldName: 'weekNumber',
      type: 'text',
      hideDefaultActions: true,
    },
    {
      label: 'Week Heading',
      fieldName: 'heading',
      type: 'text',
      hideDefaultActions: true,
    },
  ];

  @wire(getProjectTimeSheetRecords)
  wiredTimesheetRecords({ error, data }) {
    if (data) {
      this.timesheetRecords = data;
      this.fetchProjectAssignments();
    } else if (error) {
      console.error(error);
    }
  }

  getProjectTimeSheets(){
    //refreshApex(this.fetchProjectAssignments)
    //refreshApex(this.timesheetRecords)
    getProjectTimeSheetRecords({ })
    .then(result =>{
      this.timesheetRecords = result
      this.fetchProjectAssignments();
    })
    .catch(error =>{
      
  })
}

  connectedCallback() {
    const currentYear = new Date().getFullYear();
    const totalWeeks = this.getWeeksInYear(currentYear);
    this.weeks = Array.from({ length: totalWeeks }, (_, i) => this.generateWeekData(currentYear, i + 1));
    this.updateVisibleWeeks();

    const currentWeekNumber = getWeekNumber(new Date());
    this.currentWeekNumber = currentWeekNumber
    // Find the index of the current week object in the weeks array
    const currentWeekIndex = this.weeks.findIndex((week) => week.weekNumber === currentWeekNumber);
  
    if (currentWeekIndex >= 0) {
      // Calculate the scroll offset to make the current week's tab visible
      const visibleTabs = Math.min(this.visibleTabs, totalWeeks);
      this.scrollOffset = Math.max(0, currentWeekIndex - Math.floor(visibleTabs / 2));
      this.updateVisibleWeeks();
  
      // Set the selectedWeek and activeTabValue properties
      this.selectedWeek = this.weeks[currentWeekIndex];
      this.activeTabValue = String(currentWeekNumber);
      this.tabClickConnectedCallBack(this.currentWeekNumber)

    }
  
    // Fetch the project assignments for the current week
    this.fetchProjectAssignments();
    this.selectCurrentWeekTab();
  }

  selectCurrentWeekTab() {
    const tabElement = this.template.querySelector(`.tab[data-week="${this.activeTabValue}"]`);
    if (tabElement) {
      // Remove the 'active' class from all tabs
      const tabs = this.template.querySelectorAll('.tab');
      tabs.forEach((tab) => {
        tab.classList.remove('active');
      });
  
      // Add the 'active' class to the current week's tab
      tabElement.classList.add('active');
  
      // Programmatically call handleTabClickEvent()
      this.handleTabClickEvent({
        currentTarget: tabElement
      });
    }
  }
  

  updateVisibleWeeks() {
    this.visibleWeeks = this.weeks.slice(this.scrollOffset, this.scrollOffset + this.visibleTabs);
  }

  scrollLeft() {
    if (this.scrollOffset > 0) {
      this.scrollOffset--;
      this.updateVisibleWeeks();
    }
  }

  scrollRight() {
    if (this.scrollOffset + this.visibleTabs < this.weeks.length) {
      this.scrollOffset++;
      this.updateVisibleWeeks();
    }
  }

  handleTabClick(event) {
    const tabs = this.template.querySelectorAll('.tab');

    // Remove the active class from all tabs
    tabs.forEach(tab => tab.classList.remove('active'));
  
    // Add the active class to the clicked tab
    event.currentTarget.classList.add('active');
    console.log('event ' + JSON.stringify(event))
    //this.handleTabClickEvent(event);
    this.getProjectTimeSheets()
    console.log('event week'+JSON.stringify(event.currentTarget.dataset.week))
    //refreshApex(this.timesheetRecords)
    const weekNumber = parseInt(event.currentTarget.dataset.week);
    this.selectedWeek = this.weeks.find((week) => week.weekNumber === weekNumber);
    
    
    //this.values
    //console.log('daysArray' + JSON.stringify(this.daysArray))
    this.activeTabValue = String(weekNumber);

   
   
  }

  tabClickConnectedCallBack(currentWeekNumber){
    const weekNumber = currentWeekNumber;
    console.log('currentWeekNumber'+currentWeekNumber)
    this.selectedWeek = this.weeks.find((week) => week.weekNumber === weekNumber);
    this.activeTabValue = String(weekNumber);
    this.getProjectTimeSheets()
    
  }

  renderedCallback(){
    const foundWeek = this.visibleWeeks.find(week => week.weekNumber === this.currentWeekNumber);
  const weekHeading = foundWeek ? foundWeek.heading : "";
  
  const tabs1 = this.template.querySelectorAll('.tab');
  let tabTest = null; // Initialize tabTest to null

  tabs1.forEach(tab => {
    if (tab.innerHTML === weekHeading) {
      tabTest = tab;
    }
    console.log('Tab content:', tab.innerHTML);
  });

  if(tabTest) {
    tabTest.classList.add('active');
  }
     this.currentWeekNumber = '';
  }

  handleSave(){
    
      console.log(this.inputMap)
    var inputArray = [];
    for(let key of this.inputMap.keys() ){
      var input = {
        'projectId' : key.slice(0,18),
        'myDate' :key.slice(18),
        'workHours' : this.inputMap.get(key)
      }
      inputArray.push(input);
    }
    var inputJson = JSON.stringify(inputArray)
    //console.log('inputArray'+JSON.stringify(inputArray))
    
    insertProjectTimesheet({inputFromJs : inputJson })
    .then(result =>{
      
      //console.log('timesheetRecords '+ JSON.stringify(this.timesheetRecords))
      //this.fetchProjectAssignments()
      if(result == 'ok'){
      console.log('Hello')
      
      this.dispatchEvent(new ShowToastEvent({
        title: 'Success!!',
        message: 'Saved Successfully',
        variant: 'success'  
    }));

  }else{
    this.dispatchEvent(new ShowToastEvent({
      title: 'Error!!',
      message: 'This Project is not active for this particular Date',
      variant: 'error'
  }));
  }
    refreshApex(this.timesheetRecords); 
    this.getProjectTimeSheets()
    })
    .catch(error =>{
      console.log('error' + JSON.stringify(error))
      this.dispatchEvent(new ShowToastEvent({
        title: 'Error!!',
        message: 'Some error occured.Please contact your administrator.',
        variant: 'error'
    }));

    })
    // this.getProjectTimeSheets()
    // this.fetchProjectAssignments();
  }

  handleChange(event){
    const projectId = event.currentTarget.dataset.projectId;
    const date1 = event.currentTarget.dataset.date;
    //const myDate = convertDate(date1);
    console.log('workHours ' + event.target.value)
    console.log('projectId '+ projectId)
    console.log('myDate ' + date1)
    this.inputMap.set(projectId+date1,event.target.value)
  }

  generateWeekData(year, weekNumber) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (firstDayOfYear.getDay() + 6) % 7; // Offset to start on Monday
    this.startDate = new Date(year, 0, 1 + (weekNumber - 1) * 7 - daysOffset);
    this.endDate = new Date(this.startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    const days=[];
    this.daysArray = days
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(this.startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const day = currentDate.toLocaleString('en-US', { weekday: 'long' });
      const date = currentDate.toLocaleString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const newDate = convertDate(date);
      
      days.push({ day, newDate, workHours: '' });
    }
    return {
      weekNumber,
      heading: `Week ${weekNumber} (${this.startDate.toLocaleString('en-US', { month: 'short', year: 'numeric' })} - ${this.endDate.toLocaleString('en-US', { month: 'short', year: 'numeric' })})`,
      days
    };
  }

  fetchProjectAssignments() {
    if (!this.timesheetRecords) {
      return;
    }
    console.log('timesheetRecords' + JSON.stringify(this.timesheetRecords))
      const tsMap = new Map();
      for(let ts of this.timesheetRecords  ){
        tsMap.set(ts.Project__r.Id + ts.Date__c,ts)
      }
      console.log(tsMap.keys())
    getProjectAssignmentRecords()
      .then(result1 => {
        var tempArray = []
        
        this.projectAssignments = result1;
        var tempDays = []
        var loopCount = 0;
        
        //console.log('Weeks'+JSON.stringify(this.selectedWeek.days))
        for(let i = 0;i < this.projectAssignments.length; i++){
          var tempWeek = []
          
          this.projectName = this.projectAssignments[i].Project__r.Name
            for(let day of this.selectedWeek.days){
              //console.log('date' + day.newDate)
              var dateFormatNew = formatDate(day.newDate);
              console.log('date' + dateFormatNew)
              var record = tsMap.get(this.projectAssignments[i].Project__r.Id+dateFormatNew);
              //console.log('record'+record)
              var startDate = new Date(this.projectAssignments[i].Project__r.Start_Date__c);
              var endDate = new Date(this.projectAssignments[i].Project__r.End_Date__c);
              var currentDate = new Date(dateFormatNew);
              const isBetween = currentDate >= startDate && currentDate <= endDate;
              var currentDay = {
                "day" : day.day,
                "workHours" : record != undefined ?record.No_Of_Hours_Worked__c:'',
                "date" : day.newDate,
                "isBetween" : isBetween == true ? false: true
              }
              tempWeek.push(currentDay)
            }
            //console.log('Weeks'+JSON.stringify(tempWeek))
            var totalWorkHours = 0;
              for (var j = 0; j < tempWeek.length; j++) {
              var currentDay = tempWeek[j];
              var workHours = currentDay.workHours;
              // Check if workHours is a valid value before adding it to the total
              if (workHours !== '') {
                totalWorkHours += parseFloat(workHours);
              }
            }
            console.log('Total work hours:', totalWorkHours);
            var temp = {
              Id : result1[i].Project__r.Id,
              projectName : result1[i].Project__r.Name,
              currentWeek : tempWeek,
              projectId : result1[i].Project__r.Id,
              totalWorkHours : totalWorkHours
            }
            tempArray.push(temp)
            
           // console.log('JSON'+JSON.stringify(tempArray))
          }
          
          // console.log('temp'+JSON.stringify(temp))
          
            // var temp = {
            //   Id : this.projectAssignments[i].Project__r.Id,
            //   projectName : this.projectAssignments[i].Project__r.Name,
            //   currentWeek : this.selectedWeek
              
            // }
            // tempArray.push(temp)
           //}
          // this.projectAssignments = tempArray
        this.projectAssignments = tempArray
        
        //console.log('this.projectAssignments'+JSON.stringify(this.projectAssignments))
        // {"Id":"a0N2w00000EJielEAD",
        // "Name":"PA-0001",
        // "User__c":"0052w00000Gn9FdAAJ",
        // "Project__c":"a0I2w00000DETTYEA5",
        // "Project__r":{"Name":"Emerald Tyres",
        // "Id":"a0I2w00000DETTYEA5"}
      })
      .catch(error => {
        console.error('Error fetching project assignments', error);
      });
  }


  // fetchProjectTimesheet(){
  //   getPtojectTimeSheetRecords({fristDOW : this.startDate, lastDOW : this.endDate})
  //   .then(result=>{
  //     this.projectTimesheet = result;
      
  //   })
  //   .catch(error=>{
  //     console.log('error ' + error);
  //   })
    
  // }


  get isScrollLeftDisabled() {
    return this.scrollOffset === 0;
  }

  get isScrollRightDisabled() {
    return this.scrollOffset + this.visibleTabs >= this.weeks.length;
  }

  getWeeksInYear(year) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (firstDayOfYear.getDay() + 6) % 7; // Offset to start on Monday
    const daysInYear = this.isLeapYear(year) ? 366 : 365;
    const numWeeks = Math.ceil((daysInYear - daysOffset) / 7) + 1;
    return numWeeks;
  }

  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  
}


function convertDateFormatNew(dateString) {
  var parts = dateString.split('-'); // Split the date string by dashes
  var year = parts[0];
  var month = parts[1];
  var day = parts[2];
  var formattedDate = day + '/' + month + '/' + year; // Rearrange the elements
  return formattedDate;
}

function formatDate(dateString) {
  // Split the date string into month, day, and year
  const dateParts = dateString.split('/');
  const month = dateParts[1];
  const day = dateParts[0];
  const year = dateParts[2];

  // Create a new date string in the desired format
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
}

function convertDate(dateString) {
  // Split the date string into month, day, and year
  const dateParts = dateString.split('/');
  const month = dateParts[0];
  const day = dateParts[1];
  const year = dateParts[2];

  // Create a new date string in the desired format
  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
}

// Helper function to calculate the week number
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  const firstDayOfWeek = (firstDayOfYear.getDay() + 6) % 7; // Adjusted for Monday as the first day of the week
  
  return Math.ceil((pastDaysOfYear + firstDayOfWeek + 2) / 7);
}