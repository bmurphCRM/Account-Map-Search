public with sharing class AccountMapController {
    
    public class AccountSearchResult {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public String type;
        @AuraEnabled public String category;
        @AuraEnabled public String street;
        @AuraEnabled public String city;
        @AuraEnabled public String state;
        @AuraEnabled public String postalCode;
        @AuraEnabled public String country;
        @AuraEnabled public Decimal latitude;
        @AuraEnabled public Decimal longitude;
        @AuraEnabled public String fullAddress;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<AccountSearchResult> searchAccounts(
        String searchName,
        String searchType,
        String searchCategory,
        String searchZipCode
    ) {
        try {
            // Build dynamic SOQL query
            String query = 'SELECT Id, Name, Type, Category__c, ' +
                          'ShippingStreet, ShippingCity, ShippingState, ' +
                          'ShippingPostalCode, ShippingCountry, ' +
                          'ShippingLatitude, ShippingLongitude ' +
                          'FROM Account WHERE ShippingLatitude != null AND ShippingLongitude != null';
            
            List<String> conditions = new List<String>();
            
            if (String.isNotBlank(searchName)) {
                conditions.add('Name LIKE \'%' + String.escapeSingleQuotes(searchName) + '%\'');
            }
            
            if (String.isNotBlank(searchType)) {
                conditions.add('Type = \'' + String.escapeSingleQuotes(searchType) + '\'');
            }
            
            if (String.isNotBlank(searchCategory)) {
                conditions.add('Category__c = \'' + String.escapeSingleQuotes(searchCategory) + '\'');
            }
            
            if (String.isNotBlank(searchZipCode)) {
                conditions.add('ShippingPostalCode LIKE \'' + String.escapeSingleQuotes(searchZipCode) + '%\'');
            }
            
            if (!conditions.isEmpty()) {
                query += ' AND ' + String.join(conditions, ' AND ');
            }
            
            query += ' ORDER BY Name LIMIT 200';
            
            List<Account> accounts = Database.query(query);
            List<AccountSearchResult> results = new List<AccountSearchResult>();
            
            for (Account acc : accounts) {
                AccountSearchResult result = new AccountSearchResult();
                result.id = acc.Id;
                result.name = acc.Name;
                result.type = acc.Type;
                result.category = acc.Category__c;
                result.street = acc.ShippingStreet;
                result.city = acc.ShippingCity;
                result.state = acc.ShippingState;
                result.postalCode = acc.ShippingPostalCode;
                result.country = acc.ShippingCountry;
                result.latitude = acc.ShippingLatitude;
                result.longitude = acc.ShippingLongitude;
                
                // Build full address
                List<String> addressParts = new List<String>();
                if (String.isNotBlank(acc.ShippingStreet)) addressParts.add(acc.ShippingStreet);
                if (String.isNotBlank(acc.ShippingCity)) addressParts.add(acc.ShippingCity);
                if (String.isNotBlank(acc.ShippingState)) addressParts.add(acc.ShippingState);
                if (String.isNotBlank(acc.ShippingPostalCode)) addressParts.add(acc.ShippingPostalCode);
                result.fullAddress = String.join(addressParts, ', ');
                
                results.add(result);
            }
            
            return results;
        } catch (Exception e) {
            throw new AuraHandledException('Error searching accounts: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getAccountTypes() {
        try {
            List<String> types = new List<String>();
            Schema.DescribeFieldResult fieldResult = Account.Type.getDescribe();
            List<Schema.PicklistEntry> entries = fieldResult.getPicklistValues();
            
            for (Schema.PicklistEntry entry : entries) {
                if (entry.isActive()) {
                    types.add(entry.getValue());
                }
            }
            
            return types;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching account types: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getAccountCategories() {
        try {
            List<String> categories = new List<String>();
            Schema.DescribeFieldResult fieldResult = Account.Category__c.getDescribe();
            List<Schema.PicklistEntry> entries = fieldResult.getPicklistValues();
            
            for (Schema.PicklistEntry entry : entries) {
                if (entry.isActive()) {
                    categories.add(entry.getValue());
                }
            }
            
            return categories;
        } catch (Exception e) {
            // If Category__c doesn't exist, return empty list
            return new List<String>();
        }
    }
}