public without sharing class UserStoryController {
    
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
    public static list<User_Story__c> getTaskRecords(String projectName, date startDate, date endDate, String assignedTo ){
        try {
            if(assignedTo == 'assignedToMe'){ 
            ID currentUserId = UserInfo.getUserId();
            if(projectName == 'All'){
                List<User_Story__c> tasksWithOwnerPhotoUrl = new List<User_Story__c>();
                List<Project__c> projectRecords = [SELECT id,Name FROM Project__c]; 
                //List<User> users = [SELECT id,Name FROM User WHERE Id = :projectName]; 
                List<User_Story__c> taskRecords = [SELECT Id,OwnerId,Contact__c,Contact__r.Name,Assigned_To__c,Project__c,Project__r.Name, Status__c,Start_Date__c,End_Date__c,Subject__c FROM User_Story__c WHERE  Assigned_To__c = :currentUserId AND ( (Task_Start_Date__c >= :startDate AND Task_Start_Date__c <= :endDate) OR (Task_End_Date__c>= :startDate AND Task_End_Date__c<= :endDate) )];
                Set<Id> ownerIds = new Set<Id>();
            for (User_Story__c task : taskRecords) {
            ownerIds.add(task.Assigned_To__c);
            }

            Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Name, FullPhotoUrl FROM User WHERE Id IN :ownerIds]);
        
        // Populate the tasks with the Owner's PhotoUrl
        for (User_Story__c task : taskRecords) {
            User owner = userMap.get(task.Assigned_To__c);
            if (owner != null && owner.FullPhotoUrl != null) {
                task.PhotoUrl__c = owner.FullPhotoUrl; // Assuming Owner.PhotoUrl is a custom field on Task
                tasksWithOwnerPhotoUrl.add(task);
            }
        }
        
                return tasksWithOwnerPhotoUrl;
            }
            
            else {
            List<Project__c> projectRecords = [SELECT id,Name FROM Project__c WHERE Name = :projectName]; 
            //List<User> users = [SELECT id,Name FROM User WHERE Id = :projectName]; 
            List<User_Story__c> taskRecords = [SELECT Id,OwnerId,Contact__c,Contact__r.Name,Assigned_To__c,Project__c,Project__r.Name, Status__c,Start_Date__c,End_Date__c,Subject__c FROM User_Story__c WHERE Project__c = :projectRecords[0].Id AND Assigned_To__c = :currentUserId AND ((Task_Start_Date__c >= :startDate AND Task_Start_Date__c <= :endDate) OR (Task_End_Date__c>= :startDate AND Task_End_Date__c<= :endDate)) ];
            return taskRecords;
            } 

        }   else if (assignedTo == 'assignedToOthers'){
            ID currentUserId = UserInfo.getUserId();
            if(projectName == 'All'){
                List<User_Story__c> tasksWithOwnerPhotoUrl = new List<User_Story__c>();
                List<Project__c> projectRecords = [SELECT id,Name FROM Project__c]; 
                //List<User> users = [SELECT id,Name FROM User WHERE Id = :projectName]; 
                List<User_Story__c> taskRecords = [SELECT Id,OwnerId,Contact__c,Contact__r.Name,Assigned_To__c,Project__c,Project__r.Name, Status__c,Start_Date__c,End_Date__c,Subject__c FROM User_Story__c WHERE Assigned_To__c != :currentUserId AND ( (Task_Start_Date__c >= :startDate AND Task_Start_Date__c <= :endDate) OR (Task_End_Date__c>= :startDate AND Task_End_Date__c<= :endDate) )];
                Set<Id> ownerIds = new Set<Id>();
            for (User_Story__c task : taskRecords) {
            ownerIds.add(task.Assigned_To__c);
            }

            Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Name, FullPhotoUrl FROM User WHERE Id IN :ownerIds]);
        
        // Populate the tasks with the Owner's PhotoUrl
        for (User_Story__c task : taskRecords) {
            User owner = userMap.get(task.Assigned_To__c);
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
            List<User_Story__c> taskRecords = [SELECT Id,OwnerId,Contact__c,Contact__r.Name,Assigned_To__c,Project__c,Project__r.Name, Status__c,Start_Date__c,End_Date__c,Subject__c FROM User_Story__c WHERE Project__c = :projectRecords[0].Id AND Assigned_To__c != :currentUserId AND ((Task_Start_Date__c >= :startDate AND Task_Start_Date__c <= :endDate) OR (Task_End_Date__c>= :startDate AND Task_End_Date__c<= :endDate)) ];
            return taskRecords;
            }
        }
        else if (assignedTo == 'all'){
            ID currentUserId = UserInfo.getUserId();
            if(projectName == 'All'){
                List<User_Story__c> tasksWithOwnerPhotoUrl = new List<User_Story__c>();
                List<Project__c> projectRecords = [SELECT id,Name FROM Project__c]; 
                //List<User> users = [SELECT id,Name FROM User WHERE Id = :projectName]; 
                List<User_Story__c> taskRecords = [SELECT Id,OwnerId,Contact__c,Contact__r.Name,Assigned_To__c,Project__c,Project__r.Name, Status__c,Start_Date__c,End_Date__c,Subject__c FROM User_Story__c WHERE  ( (Task_Start_Date__c >= :startDate AND Task_Start_Date__c <= :endDate) OR (Task_End_Date__c>= :startDate AND Task_End_Date__c<= :endDate) )];
                Set<Id> ownerIds = new Set<Id>();
            for (User_Story__c task : taskRecords) {
            ownerIds.add(task.Assigned_To__c);
            }

            Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Name, FullPhotoUrl FROM User WHERE Id IN :ownerIds]);
        
        // Populate the tasks with the Owner's PhotoUrl
        for (User_Story__c task : taskRecords) {
            User owner = userMap.get(task.Assigned_To__c);
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
            List<User_Story__c> taskRecords = [SELECT Id,OwnerId,Contact__c,Contact__r.Name,Assigned_To__c,Project__c,Project__r.Name, Status__c,Start_Date__c,End_Date__c,Subject__c FROM User_Story__c WHERE Project__c = :projectRecords[0].Id AND ((Task_Start_Date__c >= :startDate AND Task_Start_Date__c <= :endDate) OR (Task_End_Date__c>= :startDate AND Task_End_Date__c<= :endDate)) ];
            return taskRecords;
            }
        }
        
            else{
                    ID currentUserId = UserInfo.getUserId();
                    if(projectName == 'All'){
                        List<User_Story__c> tasksWithOwnerPhotoUrl = new List<User_Story__c>();
                        List<Project__c> projectRecords = [SELECT id,Name FROM Project__c]; 
                        //List<User> users = [SELECT id,Name FROM User WHERE Id = :projectName]; 
                        List<User_Story__c> taskRecords = [SELECT Id,OwnerId,Contact__c,Contact__r.Name,Assigned_To__c,Project__c,Project__r.Name, Status__c,Start_Date__c,End_Date__c,Subject__c FROM User_Story__c WHERE Assigned_To__r.Name = :assignedTo AND ( (Task_Start_Date__c >= :startDate AND Task_Start_Date__c <= :endDate) OR (Task_End_Date__c>= :startDate AND Task_End_Date__c<= :endDate) )];
                        Set<Id> ownerIds = new Set<Id>();
                    for (User_Story__c task : taskRecords) {
                    ownerIds.add(task.Assigned_To__c);
                    }
        
                    Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Name, FullPhotoUrl FROM User WHERE Id IN :ownerIds]);
                
                // Populate the tasks with the Owner's PhotoUrl
                for (User_Story__c task : taskRecords) {
                    User owner = userMap.get(task.Assigned_To__c);
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
                    List<User_Story__c> taskRecords = [SELECT Id,OwnerId,Contact__c,Contact__r.Name,Assigned_To__c,Project__c,Project__r.Name, Status__c,Start_Date__c,End_Date__c,Subject__c FROM User_Story__c WHERE Project__c = :projectRecords[0].Id AND Assigned_To__r.Name = :assignedTo AND ((Task_Start_Date__c >= :startDate AND Task_Start_Date__c <= :endDate) OR (Task_End_Date__c>= :startDate AND Task_End_Date__c<= :endDate)) ];
                    return taskRecords;
                    } 
            
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
        List<User_Story__c> tasksWithOwnerPhotoUrl = new List<User_Story__c>();
        List<User_Story__c> taskRecords = [SELECT Id,OwnerId,Contact__c,Contact__r.Name,Assigned_To__c,Project__c,Project__r.Name, Status__c,Start_Date__c,End_Date__c,Subject__c FROM User_Story__c WHERE Id = :recordId];
        Set<Id> ownerIds = new Set<Id>();
            for (User_Story__c task : taskRecords) {
            ownerIds.add(task.OwnerId);
            }

            Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Name, FullPhotoUrl FROM User WHERE Id IN :ownerIds]);
        
        // Populate the tasks with the Owner's PhotoUrl
        for (User_Story__c task : taskRecords) {
            User owner = userMap.get(task.OwnerId);
            if (owner != null && owner.FullPhotoUrl != null) {
                task.PhotoUrl__c = owner.FullPhotoUrl; // Assuming Owner.PhotoUrl is a custom field on Task
                tasksWithOwnerPhotoUrl.add(task);
            }
        }
        if(tasksWithOwnerPhotoUrl[0] != null){
            tasksWithOwnerPhotoUrl[0].Status__c = status;
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
    public static List<User_Story__c> getTaskData() {
        List<User_Story__c> tasksWithOwnerPhotoUrl = new List<User_Story__c>();

        List<User_Story__c> taskRecords = [SELECT Id,Subject__c,OwnerId,Due_Date__c FROM User_Story__c];
        Set<Id> ownerIds = new Set<Id>();
            for (User_Story__c task : taskRecords) {
            ownerIds.add(task.OwnerId);
            }

            Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Name, FullPhotoUrl FROM User WHERE Id IN :ownerIds]);
        
        // Populate the tasks with the Owner's PhotoUrl
        for (User_Story__c task : taskRecords) {
            User owner = userMap.get(task.OwnerId);
            if (owner != null && owner.FullPhotoUrl != null) {
                task.PhotoUrl__c = owner.FullPhotoUrl; // Assuming Owner.PhotoUrl is a custom field on Task
                tasksWithOwnerPhotoUrl.add(task);
            }
        }
        
        return tasksWithOwnerPhotoUrl;
    }

    @AuraEnabled(cacheable=true)
    public static List<User_Story__c> getAllTask(date startDate, date endDate){
        system.debug('startDate' + startDate);
        system.debug('endDate' + endDate);
        List<Project__c> projectRecords = [SELECT id,Name FROM Project__c];
        List<User_Story__c> taskRecords = [SELECT Id,OwnerId,Assigned_To__c,Project__c,Project__r.Name, Status__c,Start_Date__c,End_Date__c,Subject__c FROM User_Story__c  WHERE (Task_Start_Date__c >= :startDate AND Task_Start_Date__c <= :endDate) OR (Task_End_Date__c>= :startDate AND Task_End_Date__c<= :endDate)];
        return taskRecords;
    }

    @AuraEnabled(cacheable =  true)
    public static List<String> getUserNames() {
        ID currentUserId = UserInfo.getUserId();
        List<String> userNames = new List<String>();
        List<User> uNames = [SELECT Id,Name, Profile.Name FROM User WHERE IsActive = TRUE AND Id != :currentUserId AND Profile.Name IN ('CQ Customer Community Login', 'CQ Customer Community Plus Login')];
        // Retrieve users based on profiles
        for (User u : uNames) {
            userNames.add(u.Name);
        }
        
        return userNames;
    }

    @AuraEnabled(cacheable = true)
    public static String getDescription(String userStoryId) {
        User_Story__c story = [SELECT Description__c FROM User_Story__c WHERE Id = :userStoryId LIMIT 1];
        return story.Description__c;
    }

    @AuraEnabled(cacheable = false)
    public static List<Comments__c> getComments(String userStoryId) {
        List<Comments__c> commentsRecords = [SELECT  Id, LastModifiedDate, Comments__c, CreatedBy.Name, Name FROM Comments__c WHERE User_Story__c = :userStoryId];
        system.debug('commentsRecords' +commentsRecords);
        return commentsRecords;
    }

    @AuraEnabled
    public static void saveComments(String userStoryId, String commentName, String comments ){
        if(commentName != null){
        Comments__c newComment = new Comments__c(
            User_Story__c = userStoryId,
            Comments__c = comments,
            Name = commentName
        );
        insert newComment;
        }
    }
}
