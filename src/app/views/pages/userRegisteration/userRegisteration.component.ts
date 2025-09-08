import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RegisterUserAuthService, BatchService } from '../../../services/auth.service';
import { CountryService, Country } from '../../../services/auth.service';
import { StateService, State } from '../../../services/auth.service';
import { CityService, City } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';

declare var bootstrap: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  providers: [RegisterUserAuthService, CountryService, StateService, CityService, BatchService],
  templateUrl: './userRegisteration.component.html',
  styleUrls: ['./userRegisteration.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  registerForm: any = {
    name: '',
    email: '',
    mobile_number: '',
    profilePic: null,
    date_of_birth: '',
    city: null,
    state: null,
    country: null,
    fcm: '',
    address: '',
    deviceId: '',
    batchId: null
  };

  countries: Country[] = [];
  states: State[] = [];
  cities: City[] = [];
  batches: any[] = [];
  
  loading: boolean = false;
  countriesLoading: boolean = false;
  statesLoading: boolean = false;
  citiesLoading: boolean = false;
  batchesLoading: boolean = false;
  registrationSuccess: boolean = false;

  // Track which fields have been touched/interacted with
  touchedFields: any = {
    name: false,
    email: false,
    mobile_number: false,
    country: false,
    state: false,
    city: false,
    batchId: false
  };

  // Validation error messages
  validationErrors: any = {
    name: '',
    email: '',
    mobile_number: '',
    country: '',
    state: '',
    city: '',
    batchId: ''
  };

  registerModal: any;

  constructor(
    private registerService: RegisterUserAuthService,
    private countryService: CountryService,
    private stateService: StateService,
    private cityService: CityService,
    private batchService: BatchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchCountries();
    this.fetchStates();
    this.fetchCities();
    this.fetchBatches();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('registerModal');
      if (modalElement) {
        this.registerModal = new bootstrap.Modal(modalElement);
      }
    }, 300);
  }

  openRegisterModal(): void {
    this.resetForm();
    if (this.registerModal) {
      this.registerModal.show();
    }
  }

  closeModal(): void {
    if (this.registerModal) {
      this.registerModal.hide();
    }
    this.resetForm();
  }

  async fetchCountries(): Promise<void> {
    this.countriesLoading = true;
    try {
      const response = await this.countryService.getAllCountries({
        page: 1,
        limit: 1000,
        search: ''
      });
      this.countries = response.docs;
    } catch (error) {
      console.error('Error fetching countries:', error);
      swalHelper.showToast('Failed to fetch countries', 'error');
    } finally {
      this.countriesLoading = false;
      this.cdr.detectChanges();
    }
  }

  async fetchStates(): Promise<void> {
    this.statesLoading = true;
    try {
      const response = await this.stateService.getAllStates({
        page: 1,
        limit: 1000,
        search: ''
      });
      this.states = response.docs;
    } catch (error) {
      console.error('Error fetching states:', error);
      swalHelper.showToast('Failed to fetch states', 'error');
    } finally {
      this.statesLoading = false;
      this.cdr.detectChanges();
    }
  }

  async fetchCities(): Promise<void> {
    this.citiesLoading = true;
    try {
      const response = await this.cityService.getAllCities({
        page: 1,
        limit: 1000,
        search: ''
      });
      this.cities = response.docs;
    } catch (error) {
      console.error('Error fetching cities:', error);
      swalHelper.showToast('Failed to fetch cities', 'error');
    } finally {
      this.citiesLoading = false;
      this.cdr.detectChanges();
    }
  }

  async fetchBatches(): Promise<void> {
    this.batchesLoading = true;
    try {
      const response = await this.batchService.listActiveBatches({
        page: 1,
        limit: 1000
      });
      this.batches = response.data?.batches?.docs || [];
    } catch (error) {
      console.error('Error fetching batches:', error);
      swalHelper.showToast('Failed to fetch batches', 'error');
    } finally {
      this.batchesLoading = false;
      this.cdr.detectChanges();
    }
  }

  onMobileInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    this.registerForm.mobile_number = value;
    input.value = value;
    
    // Mark as touched and validate
    this.touchedFields.mobile_number = true;
    if (value.length === 10) {
      this.validationErrors.mobile_number = '';
    } else if (value.length > 0) {
      this.validateMobileNumber();
    }
  }

  validateName(): boolean {
    if (!this.touchedFields.name) {
      return true; // Don't validate untouched fields
    }

    const name = this.registerForm.name.trim();
    if (!name) {
      this.validationErrors.name = 'Full name is required';
      return false;
    }
    if (name.length < 2) {
      this.validationErrors.name = 'Full name must be at least 2 characters';
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      this.validationErrors.name = 'Full name can only contain letters and spaces';
      return false;
    }
    this.validationErrors.name = '';
    return true;
  }

  validateEmail(): boolean {
    if (!this.touchedFields.email) {
      return true;
    }

    const email = this.registerForm.email.trim();
    if (!email) {
      // Email is optional, so empty is valid
      this.validationErrors.email = '';
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.validationErrors.email = 'Please enter a valid email address';
      return false;
    }
    this.validationErrors.email = '';
    return true;
  }

  validateMobileNumber(): boolean {
    if (!this.touchedFields.mobile_number) {
      return true;
    }

    const mobile = this.registerForm.mobile_number;
    if (!mobile) {
      this.validationErrors.mobile_number = 'Mobile number is required';
      return false;
    }
    if (!/^\d{10}$/.test(mobile)) {
      this.validationErrors.mobile_number = 'Mobile number must be exactly 10 digits';
      return false;
    }
    this.validationErrors.mobile_number = '';
    return true;
  }

  validateCountry(): boolean {
    if (!this.touchedFields.country) {
      return true;
    }

    if (!this.registerForm.country) {
      this.validationErrors.country = 'Country is required';
      return false;
    }
    this.validationErrors.country = '';
    return true;
  }

  validateState(): boolean {
    if (!this.touchedFields.state) {
      return true;
    }

    if (!this.registerForm.state) {
      this.validationErrors.state = 'State is required';
      return false;
    }
    this.validationErrors.state = '';
    return true;
  }

  validateCity(): boolean {
    if (!this.touchedFields.city) {
      return true;
    }

    if (!this.registerForm.city) {
      this.validationErrors.city = 'City is required';
      return false;
    }
    this.validationErrors.city = '';
    return true;
  }

  validateBatch(): boolean {
    if (!this.touchedFields.batchId) {
      return true;
    }

    if (!this.registerForm.batchId) {
      this.validationErrors.batchId = 'Batch is required';
      return false;
    }
    this.validationErrors.batchId = '';
    return true;
  }

  onFieldBlur(fieldName: string): void {
    // Mark field as touched
    this.touchedFields[fieldName] = true;
    
    // Then validate
    switch (fieldName) {
      case 'name':
        this.validateName();
        break;
      case 'email':
        this.validateEmail();
        break;
      case 'mobile_number':
        this.validateMobileNumber();
        break;
      case 'country':
        this.validateCountry();
        break;
      case 'state':
        this.validateState();
        break;
      case 'city':
        this.validateCity();
        break;
      case 'batchId':
        this.validateBatch();
        break;
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.registerForm.profilePic = file;
    }
  }

  resetForm(): void {
    this.registerForm = {
      name: '',
      email: '',
      mobile_number: '',
      profilePic: null,
      date_of_birth: '',
      city: null,
      state: null,
      country: null,
      fcm: '',
      address: '',
      deviceId: '',
      batchId: null
    };

    // Reset validation errors
    this.validationErrors = {
      name: '',
      email: '',
      mobile_number: '',
      country: '',
      state: '',
      city: '',
      batchId: ''
    };

    // Reset touched fields
    this.touchedFields = {
      name: false,
      email: false,
      mobile_number: false,
      country: false,
      state: false,
      city: false,
      batchId: false
    };

    // Hide success message
    this.registrationSuccess = false;

    // Reset file input
    const fileInput = document.getElementById('profilePic') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async registerUser(): Promise<void> {
    try {
      // Mark all required fields as touched before final validation
      this.markAllRequiredFieldsAsTouched();
      
      if (!this.validateFormForSubmission()) {
        swalHelper.showToast('Please fix all validation errors', 'warning');
        return;
      }

      this.loading = true;
      this.registrationSuccess = false;
      
      const formData = new FormData();
      
      // Add required fields
      formData.append('name', this.registerForm.name);
      formData.append('mobile_number', this.registerForm.mobile_number);
      formData.append('city', this.registerForm.city);
      formData.append('state', this.registerForm.state);
      formData.append('country', this.registerForm.country);
      formData.append('batchId', this.registerForm.batchId);
      
      // Add optional fields if provided
      if (this.registerForm.email) {
        formData.append('email', this.registerForm.email);
      }
      if (this.registerForm.date_of_birth) {
        formData.append('date_of_birth', this.registerForm.date_of_birth);
      }
      if (this.registerForm.fcm) {
        formData.append('fcm', this.registerForm.fcm);
      }
      if (this.registerForm.address) {
        formData.append('address', this.registerForm.address);
      }
      if (this.registerForm.deviceId) {
        formData.append('deviceId', this.registerForm.deviceId);
      }
      
      // Add profile picture if provided
      if (this.registerForm.profilePic) {
        formData.append('profilePic', this.registerForm.profilePic);
      }

      const response = await this.registerService.createUser(formData);
      console.log('Register response:', response);
      
      if (response && response.success) {
        swalHelper.showToast('User registered successfully', 'success');
        this.registrationSuccess = true;
        this.closeModal();
        
        // Show success message after modal closes
        setTimeout(() => {
          this.registrationSuccess = true;
        }, 500);
      } else {
        // Show the specific error message from the API response
        const errorMessage = response?.error || response?.message || 'Failed to register user';
        swalHelper.showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('Error registering user:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to register user';
      
      if (error?.error?.error) {
        // API returned an error object with error property
        errorMessage = error.error.error;
      } else if (error?.error?.message) {
        // API returned an error object with message property
        errorMessage = error.error.message;
      } else if (error?.message) {
        // Generic error message
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        // Error is a string
        errorMessage = error;
      }
      
      swalHelper.showToast(errorMessage, 'error');
    } finally {
      this.loading = false;
    }
  }

  markAllRequiredFieldsAsTouched(): void {
    this.touchedFields.name = true;
    this.touchedFields.mobile_number = true;
    this.touchedFields.country = true;
    this.touchedFields.state = true;
    this.touchedFields.city = true;
    this.touchedFields.batchId = true;
  }

  validateFormForSubmission(): boolean {
    const name = this.registerForm.name.trim();
    const mobile = this.registerForm.mobile_number;
    
    let isValid = true;

    // Validate name
    if (!name) {
      this.validationErrors.name = 'Full name is required';
      isValid = false;
    } else if (name.length < 2) {
      this.validationErrors.name = 'Full name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      this.validationErrors.name = 'Full name can only contain letters and spaces';
      isValid = false;
    } else {
      this.validationErrors.name = '';
    }

    // Validate mobile
    if (!mobile) {
      this.validationErrors.mobile_number = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(mobile)) {
      this.validationErrors.mobile_number = 'Mobile number must be exactly 10 digits';
      isValid = false;
    } else {
      this.validationErrors.mobile_number = '';
    }

    // Validate country
    if (!this.registerForm.country) {
      this.validationErrors.country = 'Country is required';
      isValid = false;
    } else {
      this.validationErrors.country = '';
    }

    // Validate state
    if (!this.registerForm.state) {
      this.validationErrors.state = 'State is required';
      isValid = false;
    } else {
      this.validationErrors.state = '';
    }

    // Validate city
    if (!this.registerForm.city) {
      this.validationErrors.city = 'City is required';
      isValid = false;
    } else {
      this.validationErrors.city = '';
    }

    // Validate batch
    if (!this.registerForm.batchId) {
      this.validationErrors.batchId = 'Batch is required';
      isValid = false;
    } else {
      this.validationErrors.batchId = '';
    }

    return isValid;
  }

  validateForm(): boolean {
    const name = this.registerForm.name.trim();
    const mobile = this.registerForm.mobile_number;

    return name && name.length >= 2 && /^[a-zA-Z\s]+$/.test(name) &&
           mobile && /^\d{10}$/.test(mobile) &&
           this.registerForm.country &&
           this.registerForm.state &&
           this.registerForm.city &&
           this.registerForm.batchId;
  }
}