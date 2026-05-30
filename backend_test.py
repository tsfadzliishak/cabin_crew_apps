#!/usr/bin/env python3
"""
Backend API Testing Script for Stewardess Roster Application
Tests all CRUD operations and verifies data persistence
"""

import requests
import json
from datetime import datetime

# Use the external backend URL from environment
BACKEND_URL = "https://crew-schedule-mobile.preview.emergentagent.com/api"

# Test data matching the schema from review request
TEST_ROSTER_DATA = {
    "entries": [
        {
            "date": "06-JUN-2026",
            "day": "Sat",
            "duty_start_time": "06:35",
            "duty_end_time": "16:05",
            "duty_hours": "09:30",
            "is_day_off": False,
            "flights": [
                {
                    "flight_number": "MH 601",
                    "dep_airport": "KUL",
                    "dep_time": "07:50",
                    "arr_airport": "SIN",
                    "arr_time": "09:05",
                    "work_type": "OP",
                    "block_hours": "01:15",
                    "aircraft_type": "7M8"
                },
                {
                    "flight_number": "MH 602",
                    "dep_airport": "SIN",
                    "dep_time": "10:30",
                    "arr_airport": "KUL",
                    "arr_time": "11:45",
                    "work_type": "OP",
                    "block_hours": "01:15",
                    "aircraft_type": "7M8"
                }
            ]
        },
        {
            "date": "07-JUN-2026",
            "day": "Sun",
            "duty_start_time": "08:00",
            "duty_end_time": "18:30",
            "duty_hours": "10:30",
            "is_day_off": False,
            "flights": [
                {
                    "flight_number": "MH 715",
                    "dep_airport": "KUL",
                    "dep_time": "09:15",
                    "arr_airport": "BKK",
                    "arr_time": "10:30",
                    "work_type": "OP",
                    "block_hours": "02:15",
                    "aircraft_type": "73H"
                },
                {
                    "flight_number": "MH 716",
                    "dep_airport": "BKK",
                    "dep_time": "14:45",
                    "arr_airport": "KUL",
                    "arr_time": "17:45",
                    "work_type": "OP",
                    "block_hours": "02:00",
                    "aircraft_type": "73H"
                }
            ]
        },
        {
            "date": "08-JUN-2026",
            "day": "Mon",
            "is_day_off": True,
            "off_type": "DO",
            "flights": []
        },
        {
            "date": "09-JUN-2026",
            "day": "Tue",
            "duty_start_time": "05:30",
            "duty_end_time": "14:00",
            "duty_hours": "08:30",
            "is_day_off": False,
            "flights": [
                {
                    "flight_number": "MH 123",
                    "dep_airport": "KUL",
                    "dep_time": "06:45",
                    "arr_airport": "HKG",
                    "arr_time": "10:30",
                    "work_type": "OP",
                    "block_hours": "03:45",
                    "aircraft_type": "738"
                }
            ]
        },
        {
            "date": "10-JUN-2026",
            "day": "Wed",
            "duty_start_time": "11:00",
            "duty_end_time": "20:30",
            "duty_hours": "09:30",
            "is_day_off": False,
            "flights": [
                {
                    "flight_number": "MH 124",
                    "dep_airport": "HKG",
                    "dep_time": "12:15",
                    "arr_airport": "KUL",
                    "arr_time": "16:00",
                    "work_type": "OP",
                    "block_hours": "03:45",
                    "aircraft_type": "738"
                }
            ]
        }
    ]
}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}TEST: {test_name}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def test_health_check():
    """Test 1: GET /api/ - Health check"""
    print_test_header("Health Check - GET /api/")
    
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Stewardess Roster API":
                print_success("Health check passed - API is running")
                return True
            else:
                print_error(f"Unexpected response message: {data.get('message')}")
                return False
        else:
            print_error(f"Health check failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health check failed with exception: {str(e)}")
        return False

def test_create_roster():
    """Test 2: POST /api/roster - Create roster entries"""
    print_test_header("Create Roster - POST /api/roster")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/roster",
            json=TEST_ROSTER_DATA,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "count" in data and "message" in data:
                expected_count = len(TEST_ROSTER_DATA["entries"])
                if data["count"] == expected_count:
                    print_success(f"Created {data['count']} roster entries successfully")
                    return True
                else:
                    print_error(f"Expected {expected_count} entries, got {data['count']}")
                    return False
            else:
                print_error("Response missing 'count' or 'message' field")
                return False
        else:
            print_error(f"Create roster failed with status code: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Create roster failed with exception: {str(e)}")
        return False

def test_get_all_roster():
    """Test 3: GET /api/roster - Get all roster entries"""
    print_test_header("Get All Roster - GET /api/roster")
    
    try:
        response = requests.get(f"{BACKEND_URL}/roster", timeout=10)
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Retrieved {len(data)} roster entries")
            
            if len(data) > 0:
                # Verify structure of first entry
                first_entry = data[0]
                required_fields = ["id", "date", "day", "flights", "is_day_off"]
                missing_fields = [field for field in required_fields if field not in first_entry]
                
                if missing_fields:
                    print_error(f"Missing required fields: {missing_fields}")
                    return False
                
                print_success("All roster entries retrieved successfully")
                print_info(f"Sample entry: {json.dumps(first_entry, indent=2)}")
                return True
            else:
                print_warning("No roster entries found (database might be empty)")
                return True
        else:
            print_error(f"Get roster failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Get roster failed with exception: {str(e)}")
        return False

def test_get_today_roster():
    """Test 4: GET /api/roster/today - Get today's roster"""
    print_test_header("Get Today's Roster - GET /api/roster/today")
    
    try:
        response = requests.get(f"{BACKEND_URL}/roster/today", timeout=10)
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data is None:
                print_warning("Today is a day off (null response)")
                return True
            else:
                print_info(f"Today's roster: {json.dumps(data, indent=2)}")
                
                # Verify it's a single entry with required fields
                if "id" in data and "date" in data and "flights" in data:
                    print_success("Today's roster retrieved successfully")
                    return True
                else:
                    print_error("Today's roster missing required fields")
                    return False
        else:
            print_error(f"Get today's roster failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Get today's roster failed with exception: {str(e)}")
        return False

def test_get_upcoming_flights():
    """Test 5: GET /api/roster/upcoming?limit=5 - Get upcoming flights"""
    print_test_header("Get Upcoming Flights - GET /api/roster/upcoming?limit=5")
    
    try:
        response = requests.get(f"{BACKEND_URL}/roster/upcoming?limit=5", timeout=10)
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Retrieved {len(data)} upcoming flights")
            
            if len(data) > 5:
                print_error(f"Expected max 5 entries, got {len(data)}")
                return False
            
            # Verify all entries are not day-off
            day_off_entries = [entry for entry in data if entry.get("is_day_off", False)]
            if day_off_entries:
                print_error(f"Found {len(day_off_entries)} day-off entries in upcoming flights")
                return False
            
            print_success(f"Retrieved {len(data)} upcoming flights successfully")
            if len(data) > 0:
                print_info(f"First upcoming flight: {data[0].get('date')} - {data[0].get('flights', [{}])[0].get('flight_number', 'N/A')}")
            return True
        else:
            print_error(f"Get upcoming flights failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Get upcoming flights failed with exception: {str(e)}")
        return False

def test_delete_roster():
    """Test 6: DELETE /api/roster - Delete all roster"""
    print_test_header("Delete All Roster - DELETE /api/roster")
    
    try:
        response = requests.delete(f"{BACKEND_URL}/roster", timeout=10)
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "count" in data:
                print_success(f"Deleted {data['count']} roster entries")
                
                # Verify deletion by trying to get all roster
                verify_response = requests.get(f"{BACKEND_URL}/roster", timeout=10)
                if verify_response.status_code == 200:
                    remaining = verify_response.json()
                    if len(remaining) == 0:
                        print_success("Verified: All roster entries deleted")
                        return True
                    else:
                        print_error(f"Deletion verification failed: {len(remaining)} entries still exist")
                        return False
                else:
                    print_warning("Could not verify deletion")
                    return True
            else:
                print_error("Response missing 'count' field")
                return False
        else:
            print_error(f"Delete roster failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Delete roster failed with exception: {str(e)}")
        return False

def test_data_persistence():
    """Test 7: Verify data persistence in MongoDB"""
    print_test_header("Data Persistence Test")
    
    try:
        # Create roster
        print_info("Step 1: Creating roster entries...")
        create_response = requests.post(
            f"{BACKEND_URL}/roster",
            json=TEST_ROSTER_DATA,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if create_response.status_code != 200:
            print_error("Failed to create roster for persistence test")
            return False
        
        # Get all roster
        print_info("Step 2: Retrieving roster entries...")
        get_response = requests.get(f"{BACKEND_URL}/roster", timeout=10)
        
        if get_response.status_code != 200:
            print_error("Failed to retrieve roster for persistence test")
            return False
        
        data = get_response.json()
        
        # Verify data matches what we created
        if len(data) == len(TEST_ROSTER_DATA["entries"]):
            print_success("Data persistence verified - all entries retrieved")
            
            # Verify specific fields
            for i, entry in enumerate(data):
                expected = TEST_ROSTER_DATA["entries"][i]
                if entry["date"] == expected["date"] and entry["day"] == expected["day"]:
                    print_success(f"Entry {i+1} verified: {entry['date']} ({entry['day']})")
                else:
                    print_error(f"Entry {i+1} mismatch: expected {expected['date']}, got {entry['date']}")
                    return False
            
            return True
        else:
            print_error(f"Data count mismatch: expected {len(TEST_ROSTER_DATA['entries'])}, got {len(data)}")
            return False
            
    except Exception as e:
        print_error(f"Data persistence test failed with exception: {str(e)}")
        return False

def run_all_tests():
    """Run all backend API tests"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}STEWARDESS ROSTER BACKEND API TEST SUITE{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}Backend URL: {BACKEND_URL}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    
    results = {}
    
    # Test 1: Health Check
    results["Health Check"] = test_health_check()
    
    # Test 2: Create Roster
    results["Create Roster"] = test_create_roster()
    
    # Test 3: Get All Roster
    results["Get All Roster"] = test_get_all_roster()
    
    # Test 4: Get Today's Roster
    results["Get Today's Roster"] = test_get_today_roster()
    
    # Test 5: Get Upcoming Flights
    results["Get Upcoming Flights"] = test_get_upcoming_flights()
    
    # Test 6: Delete Roster
    results["Delete Roster"] = test_delete_roster()
    
    # Test 7: Data Persistence
    results["Data Persistence"] = test_data_persistence()
    
    # Print Summary
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}TEST SUMMARY{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        if result:
            print_success(f"{test_name}: PASSED")
        else:
            print_error(f"{test_name}: FAILED")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{total} tests passed{Colors.END}")
    
    if passed == total:
        print(f"{Colors.GREEN}{Colors.BOLD}✓ ALL TESTS PASSED{Colors.END}")
        return 0
    else:
        print(f"{Colors.RED}{Colors.BOLD}✗ SOME TESTS FAILED{Colors.END}")
        return 1

if __name__ == "__main__":
    exit(run_all_tests())
