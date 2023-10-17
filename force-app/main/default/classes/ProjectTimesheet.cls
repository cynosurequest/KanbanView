public without sharing class ProjectTimesheet{
    @AuraEnabled(cacheable=true)
    
    public static list<Project_Assignment__c> getProjectAssignmentRecords(){
        Id currentUserId = UserInfo.getUserId();
        //System.debug('user:' + currentUserId);
        list<Project_Assignment__c> assignedProjectForUser = [SELECT Id,Name,User__c, Project__c, Project__r.Name,Project__r.Start_Date__c,Project__r.End_Date__c FROM Project_Assignment__c WHERE User__c = :currentUserId AND Project__r.Active__c = true];
        //System.debug('assignedProjectForUser' + assignedProjectForUser);
        return assignedProjectForUser;
            
    }


   @AuraEnabled(cacheable=true)
    public static list<Project_Timesheet__c> getProjectTimeSheetRecords(){
        Id currentUserId = UserInfo.getUserId();
        list<Project_Timesheet__c> ProjectTimesheetList = [SELECT Id, Name, Date__c, No_Of_Hours_Worked__c, Project__r.Id, Project__r.Name FROM Project_Timesheet__c WHERE User__c = :currentUserId ];
        return ProjectTimesheetList;
    }

    // @AuraEnabled
    // public static decimal getWorkHours(string myDate , string ProjectName){
    //     Id currentUserId = UserInfo.getUserId();
    //     date currentDate = date.parse(myDate);
    //     //date convertedDate = currentDate.format('dd/MM/yyyy');
    //     list<Project_Timesheet__c> ProjectTimesheetList = [SELECT Id, Name, Date__c, No_Of_Hours_Worked__c, Project__r.Id, Project__r.Name FROM Project_Timesheet__c WHERE User__c = :currentUserId AND Date__c = :currentDate AND Project__r.Name = :ProjectName];
    //     if (ProjectTimesheetList.size() != 0){
    //     return ProjectTimesheetList[0].No_Of_Hours_Worked__c;
    //     } else {
    //         return null;
    //     }
    // }

    @AuraEnabled
    public static String insertProjectTimesheet(String inputFromJs){
        List<inputWrapper> inputTimesheets = (List<inputWrapper>) JSON.deserialize(inputFromJs, List<inputWrapper>.class);
        list<Project_Timesheet__c> projectList = new list<Project_Timesheet__c>();
        Id currentUserId = UserInfo.getUserId();
        User currentUser = [SELECT ContactId FROM User WHERE Id = :currentUserId];
        Id contactId = currentUser.ContactId;
        // Create a set to store unique project IDs and dates from inputWrapperList
Set<String> projectIds = new Set<String>();
Set<Date> dates = new Set<Date>();

for (InputWrapper input : inputTimesheets) {
    projectIds.add(input.projectId);
    dates.add(Date.parse(input.myDate));
}

// Query all existing Project_Timesheet__c records for the given project IDs and dates
Map<String, Map<Date, Project_Timesheet__c>> existingTimesheetsMap = new Map<String, Map<Date, Project_Timesheet__c>>();

for (Project_Timesheet__c timesheet : [SELECT Id, Date__c, No_Of_Hours_Worked__c, Project__r.Id, Project__r.Name
                                       FROM Project_Timesheet__c
                                       WHERE User__c = :currentUserId
                                       AND Date__c IN :dates
                                       AND Project__r.Id IN :projectIds]) {
    if (!existingTimesheetsMap.containsKey(timesheet.Project__r.Id)) {
        existingTimesheetsMap.put(timesheet.Project__r.Id, new Map<Date, Project_Timesheet__c>());
    }
    existingTimesheetsMap.get(timesheet.Project__r.Id).put(timesheet.Date__c, timesheet);
}

// Prepare lists for update and insert operations
List<Project_Timesheet__c> timesheetListToUpdate = new List<Project_Timesheet__c>();
List<Project_Timesheet__c> timesheetListToInsert = new List<Project_Timesheet__c>();

// Iterate through inputWrapperList and update or insert records accordingly
for (InputWrapper input : inputTimesheets) {
    Project_Timesheet__c existingTimesheet = existingTimesheetsMap.get(input.projectId)?.get(Date.parse(input.myDate));

    if (existingTimesheet != null) {
        // Record already exists, update the work hours
        existingTimesheet.No_Of_Hours_Worked__c = Decimal.valueOf(input.workHours);
        timesheetListToUpdate.add(existingTimesheet);
    } else {
        // Record doesn't exist, create a new one
        Project_Timesheet__c newTimesheet = new Project_Timesheet__c();
        newTimesheet.User__c = currentUserId;
        newTimesheet.Date__c = date.parse(input.myDate);
        newTimesheet.Project__c = input.projectId;
        newTimesheet.No_Of_Hours_Worked__c = Decimal.valueOf(input.workHours);
        newTimesheet.Contact__c = contactId;
        timesheetListToInsert.add(newTimesheet);
    }
}

// Perform update and insert operations
if (!timesheetListToUpdate.isEmpty()) {
    update timesheetListToUpdate;
}

if (!timesheetListToInsert.isEmpty()) {
    insert timesheetListToInsert;
}


        system.debug('inputTimesheets'+inputTimesheets);
        
        
        // list<Project_Timesheet__c> ProjectTimesheetList = [SELECT Id, Name, Date__c, No_Of_Hours_Worked__c, Project__r.Id, Project__r.Name FROM Project_Timesheet__c WHERE User__c = :currentUserId AND Date__c = :newDate AND Project__r.Id = :inputFromJs.projectId];
        // if(ProjectTimesheetList.size() == 0){
        //     list<Project__c> projectRecords = [SELECT Id,Name,Start_Date__c,End_Date__c FROM Project__c WHERE Active__c= true AND Id = :inputFromJs.projectId ];
        //     if(projectRecords[0].Start_Date__c <= newDate && projectRecords[0].End_Date__c >= newDate ){
        //         Project_Timesheet__c ptInsert = new Project_Timesheet__c();
        //         ptInsert.Date__c = newDate;
        //         ptInsert.No_Of_Hours_Worked__c = decimal.valueOf(inputFromJs.workHours);
        //         ptInsert.Contact__c = contactId;
        //         ptInsert.User__c = currentUserId;
        //         ptInsert.Project__c = inputFromJs.projectId;

        //         insert ptInsert;
        //         return 'ok';
        //     }else{
        //         return 'false';
        //     }
        // }else {
        //     ProjectTimesheetList[0].No_Of_Hours_Worked__c = decimal.valueOf(inputFromJs.workHours);
        //     update ProjectTimesheetList;
            return 'ok';
        //}
    }
    
    public class inputWrapper{
        @AuraEnabled
        public string projectId{get;set;}
        @AuraEnabled
        public string myDate{get;set;}
        @AuraEnabled
        public string workHours{get;set;}
    }

    // @AuraEnabled
    // public static void insertProjectTimesheet(string Date,string Project,string workHours){
    //     try {
            
    //     } catch (Exception e) {
    //         throw new AuraHandledException(e.getMessage());
    //     }
    // }



}