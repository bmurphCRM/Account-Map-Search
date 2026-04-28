import { LightningElement, track, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import searchAccounts from '@salesforce/apex/AccountMapController.searchAccounts';
import getAccountTypes from '@salesforce/apex/AccountMapController.getAccountTypes';
import getAccountCategories from '@salesforce/apex/AccountMapController.getAccountCategories';

export default class AccountMapSearch extends NavigationMixin(LightningElement) {
    // Configurable properties
    @api title = 'Service Provider Search';
    @api subtitle = '';
    
    // Search criteria
    @track searchName = '';
    @track searchType = '';
    @track searchCategory = '';
    @track searchZipCode = '';
    
    // Results
    @track accounts = [];
    @track mapMarkers = [];
    
    // Picklist options
    @track typeOptions = [];
    @track categoryOptions = [];
    
    // UI state
    @track isLoading = false;
    @track error;
    @track hasSearched = false;
    
    // Color mapping for account types
    typeColorMap = {
        'Food Provider': '#FF6B6B',
        'Shelter Provider': '#4ECDC4',
        'Medical Provider': '#45B7D1',
        'Housing Provider': '#FFA07A',
        'Mental Health Provider': '#9B59B6',
        'Employment Services': '#F39C12',
        'Legal Services': '#3498DB',
        'Other': '#95A5A6'
    };

    // Map marker icon mapping (lightning-map uses predefined icons)
    typeIconMap = {
        'Food Provider': 'custom:custom1',
        'Shelter Provider': 'custom:custom2',
        'Medical Provider': 'custom:custom3',
        'Housing Provider': 'custom:custom4',
        'Mental Health Provider': 'custom:custom5',
        'Employment Services': 'custom:custom6',
        'Legal Services': 'custom:custom7',
        'Other': 'standard:account'
    };

    // Load picklist values
    @wire(getAccountTypes)
    wiredTypes({ error, data }) {
        if (data) {
            this.typeOptions = [
                { label: '--None--', value: '' },
                ...data.map(type => ({ label: type, value: type }))
            ];
        } else if (error) {
            console.error('Error loading types:', error);
        }
    }

    @wire(getAccountCategories)
    wiredCategories({ error, data }) {
        if (data) {
            this.categoryOptions = [
                { label: '--None--', value: '' },
                ...data.map(category => ({ label: category, value: category }))
            ];
        } else if (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Input handlers
    handleNameChange(event) {
        this.searchName = event.target.value;
    }

    handleTypeChange(event) {
        this.searchType = event.detail.value;
    }

    handleCategoryChange(event) {
        this.searchCategory = event.detail.value;
    }

    handleZipCodeChange(event) {
        this.searchZipCode = event.target.value;
    }

    // Search handler
    handleSearch() {
        this.isLoading = true;
        this.error = undefined;
        this.hasSearched = true;

        searchAccounts({
            searchName: this.searchName,
            searchType: this.searchType,
            searchCategory: this.searchCategory,
            searchZipCode: this.searchZipCode
        })
        .then(result => {
            this.accounts = result;
            this.buildMapMarkers(result);
            this.isLoading = false;
        })
        .catch(error => {
            this.error = error.body?.message || 'An error occurred while searching';
            this.accounts = [];
            this.mapMarkers = [];
            this.isLoading = false;
        });
    }

    // Clear/Reset handler
    handleClear() {
        this.searchName = '';
        this.searchType = '';
        this.searchCategory = '';
        this.searchZipCode = '';
        this.accounts = [];
        this.mapMarkers = [];
        this.error = undefined;
        this.hasSearched = false;
        
        // Reset the form fields
        const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
        inputs.forEach(input => {
            input.value = '';
        });
    }

    // Build map markers from account results
    buildMapMarkers(accounts) {
        this.mapMarkers = accounts.map(account => {
            const color = this.getMarkerColor(account.type);
            
            return {
                location: {
                    Latitude: account.latitude,
                    Longitude: account.longitude
                },
                title: account.name,
                description: this.buildMarkerDescription(account, color),
                value: account.id
            };
        });
    }

    // Get marker color based on account type
    getMarkerColor(type) {
        return this.typeColorMap[type] || this.typeColorMap['Other'];
    }

    // Build marker description HTML
    buildMarkerDescription(account, color) {
        let description = `<div style="font-family: 'Salesforce Sans', Arial, sans-serif;">`;
        description += `<div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">${account.name}</div>`;
        
        if (account.fullAddress) {
            description += `<div style="margin-bottom: 6px;">📍 ${account.fullAddress}</div>`;
        }
        
        if (account.type) {
            description += `<div style="margin-bottom: 4px; display: flex; align-items: center;">`;
            description += `<span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; margin-right: 6px; border: 1px solid #fff;"></span>`;
            description += `<strong>Type:</strong> <span style="margin-left: 4px;">${account.type}</span>`;
            description += `</div>`;
        }
        
        if (account.category) {
            description += `<div style="margin-bottom: 4px;"><strong>Category:</strong> ${account.category}</div>`;
        }
        
        description += `</div>`;
        return description;
    }

    // Map marker selection handler
    handleMarkerSelect(event) {
        const selectedAccountId = event.detail.selectedMarkerValue;
        if (selectedAccountId) {
            this.navigateToRecord(selectedAccountId);
        }
    }

    // Navigate to account record
    navigateToRecord(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    }

    // Table row click handler
    handleRowClick(event) {
        const accountId = event.currentTarget.dataset.id;
        if (accountId) {
            this.navigateToRecord(accountId);
        }
    }

    // Computed properties
    get showResults() {
        return this.hasSearched && !this.isLoading;
    }

    get hasResults() {
        return this.accounts && this.accounts.length > 0;
    }

    get noResults() {
        return this.showResults && !this.hasResults;
    }

    get resultCount() {
        return this.accounts ? this.accounts.length : 0;
    }

    get resultCountLabel() {
        const count = this.resultCount;
        return count === 1 ? '1 Provider Found' : `${count} Providers Found`;
    }

    get mapZoomLevel() {
        if (this.accounts.length === 0) {
            return '10';
        }
        
        if (this.accounts.length === 1) {
            return '15';
        }
        
        // Calculate the geographic bounds
        const lats = this.accounts.map(acc => acc.latitude);
        const lngs = this.accounts.map(acc => acc.longitude);
        
        const maxLat = Math.max(...lats);
        const minLat = Math.min(...lats);
        const maxLng = Math.max(...lngs);
        const minLng = Math.min(...lngs);
        
        // Calculate the span (difference between max and min)
        const latSpan = maxLat - minLat;
        const lngSpan = maxLng - minLng;
        const maxSpan = Math.max(latSpan, lngSpan);
        
        // Determine zoom level based on span
        // These thresholds are approximate and tuned for typical city/regional views
        if (maxSpan <= 0.01) return '14';  // Very close together (neighborhood)
        if (maxSpan <= 0.05) return '12';  // Close together (few miles)
        if (maxSpan <= 0.1) return '11';   // Moderate spread (city area)
        if (maxSpan <= 0.5) return '10';   // Wider spread (metropolitan area)
        if (maxSpan <= 1.0) return '9';    // Large area (multiple cities)
        if (maxSpan <= 2.0) return '8';    // Very large area (region)
        return '7';                         // Extremely large area (state level)
    }

    get centerLocation() {
        if (this.accounts.length === 0) {
            return { Latitude: 37.7749, Longitude: -122.4194 }; // Default to San Francisco
        }
        
        // Calculate the geographic center based on bounds
        const lats = this.accounts.map(acc => acc.latitude);
        const lngs = this.accounts.map(acc => acc.longitude);
        
        const maxLat = Math.max(...lats);
        const minLat = Math.min(...lats);
        const maxLng = Math.max(...lngs);
        const minLng = Math.min(...lngs);
        
        // Center is the midpoint of the bounds
        const centerLat = (maxLat + minLat) / 2;
        const centerLng = (maxLng + minLng) / 2;
        
        return { Latitude: centerLat, Longitude: centerLng };
    }

    get showMap() {
        return this.hasResults;
    }

    get enrichedAccounts() {
        return this.accounts.map(account => {
            const color = this.getMarkerColor(account.type);
            return {
                ...account,
                colorStyle: `background-color: ${color};`
            };
        });
    }

    get hasSubtitle() {
        return this.subtitle && this.subtitle.trim().length > 0;
    }
}
