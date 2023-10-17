public class ProjectPicklistController {
    
    @AuraEnabled (cacheable=true)
    public static list<string> getProjectName(){
        try {
            List<Project__c> projects = [SELECT Id,Name FROM Project__c WHERE Active__c = TRUE];
            List<string> projectName = new List<String>();
            for (Project__c proj : projects) {
                projectName.add(proj.Name);
            }
            return projectName;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static list<Task> getTaskRecords(String projectName, date startDate, date endDate){
        try {
            if(projectName == 'All'){
                List<Task> tasksWithOwnerPhotoUrl = new List<Task>();
                List<Project__c> projectRecords = [SELECT id,Name FROM Project__c]; 
                //List<User> users = [SELECT id,Name FROM User WHERE Id = :projectName]; 
                List<Task> taskRecords = [SELECT Id,WhoId,who.Name,OwnerId,WhatId,What.Name, Status,Start_Date__c,End_Date__c,Subject FROM Task WHERE ActivityDate >= :startDate AND ActivityDate <= :endDate];
                Set<Id> ownerIds = new Set<Id>();
            for (Task task : taskRecords) {
            ownerIds.add(task.OwnerId);
            }

            Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Name, FullPhotoUrl FROM User WHERE Id IN :ownerIds]);
        
        // Populate the tasks with the Owner's PhotoUrl
        for (Task task : taskRecords) {
            User owner = userMap.get(task.OwnerId);
            if (owner != null && owner.FullPhotoUrl != null) {
                task.PhotoUrl__c = owner.FullPhotoUrl; // Assuming Owner.PhotoUrl is a custom field on Task
                tasksWithOwnerPhotoUrl.add(task);
            }
        }
        
                return tasksWithOwnerPhotoUrl;
            }
            else{
            List<Project__c> projectRecords = [SELECT id,Name FROM Project__c WHERE Name = :projectName]; 
            //List<User> users = [SELECT id,Name FROM User WHERE Id = :projectName]; 
            List<Task> taskRecords = [SELECT Id,WhoId,who.Name,WhatId,What.Name,Status,Start_Date__c,End_Date__c,Subject FROM Task WHERE WhatId = :projectRecords[0].Id AND ActivityDate >= :startDate AND ActivityDate <= :endDate];
            return taskRecords;
            }   
                
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // @AuraEnabled
    // public static TaskWrapper getProjectRecords(String projectName){
    //     List<Project__c> projectRecords = [SELECT id,Name,Start_Date__c,End_Date__c FROM Project__c WHERE Name = :projectName AND Active__c =TRUE];
    //     TaskWrapper taskInstance = new TaskWrapper();
    //     if(projectRecords[0] != null){
    //     taskInstance.startDate = projectRecords[0].Start_Date__c;
    //     taskInstance.endDate = projectRecords[0].End_Date__c;
    //     }
    //     return taskInstance;
        
    // }


    @AuraEnabled
    public static List<string> getPicklistNames(){
        try {
            List<String> statusPicklistValues = new List<String>();
            Schema.DescribeFieldResult fieldResult = Task.Status.getDescribe();
            List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
            for (Schema.PicklistEntry entry : picklistEntries) {
                statusPicklistValues.add(entry.getValue());
            }
            return statusPicklistValues;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class TaskWrapper{
        
        @AuraEnabled
        public Date startDate {get; set;}
        @AuraEnabled
        public Date endDate {get; set;}
    }

    @AuraEnabled
    public static void updateTaskStatus(String recordId, String status) {
        List<Task> tasksWithOwnerPhotoUrl = new List<Task>();
        List<Task> taskRecords = [SELECT Id,Who.Name,WhatId,What.Name,OwnerId,Status,Subject FROM Task WHERE Id = :recordId];
        Set<Id> ownerIds = new Set<Id>();
            for (Task task : taskRecords) {
            ownerIds.add(task.OwnerId);
            }

            Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Name, FullPhotoUrl FROM User WHERE Id IN :ownerIds]);
        
        // Populate the tasks with the Owner's PhotoUrl
        for (Task task : taskRecords) {
            User owner = userMap.get(task.OwnerId);
            if (owner != null && owner.FullPhotoUrl != null) {
                task.PhotoUrl__c = owner.FullPhotoUrl; // Assuming Owner.PhotoUrl is a custom field on Task
                tasksWithOwnerPhotoUrl.add(task);
            }
        }
        if(tasksWithOwnerPhotoUrl[0] != null){
            tasksWithOwnerPhotoUrl[0].Status = status;
        try {
            update tasksWithOwnerPhotoUrl;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating task status: ' + e.getMessage());
        }
    }
    else{
        System.debug('null');
    }
}

    @AuraEnabled(cacheable=true)
    public static List<Task> getTaskData() {
        List<Task> tasksWithOwnerPhotoUrl = new List<Task>();

        List<Task> taskRecords = [SELECT Id,Subject,WhoId,Who.Name,OwnerId,ActivityDate FROM Task];
        Set<Id> ownerIds = new Set<Id>();
            for (Task task : taskRecords) {
            ownerIds.add(task.OwnerId);
            }

            Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Name, FullPhotoUrl FROM User WHERE Id IN :ownerIds]);
        
        // Populate the tasks with the Owner's PhotoUrl
        for (Task task : taskRecords) {
            User owner = userMap.get(task.OwnerId);
            if (owner != null && owner.FullPhotoUrl != null) {
                task.PhotoUrl__c = owner.FullPhotoUrl; // Assuming Owner.PhotoUrl is a custom field on Task
                tasksWithOwnerPhotoUrl.add(task);
            }
        }
        
        return tasksWithOwnerPhotoUrl;
    }

    @AuraEnabled(cacheable=true)
    public static List<Task> getAllTask(date startDate, date endDate){
        system.debug('startDate' + startDate);
        system.debug('endDate' + endDate);
        List<Project__c> projectRecords = [SELECT id,Name FROM Project__c];
        List<Task> taskRecords = [SELECT Id,WhoId,who.Name,WhatId,What.Name,Status,Start_Date__c,End_Date__c,Subject FROM Task  WHERE ActivityDate >= :startDate AND ActivityDate <= :endDate];
        return taskRecords;
    }
}