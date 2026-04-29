#include <bits/stdc++.h>
#include "patient.h"
#include "ambulance.h"
#include "graph.h"
#include "routing.h"
#include "hospital.h"
#include "er.h"

using namespace std;

int main() {

    createGraph();

    vector<string> ambulances = {"B","C","D"};

    vector<Hospital> hospitals = {
        {"CityHospital","general","government",true,"A",true,false},
        {"HeartCare","cardiac","private",true,"B",true,true},
        {"CancerCare","oncology","private",true,"D",false,false},
        {"MotherCare","maternity","government",true,"E",true,false},
        {"SurgeryCenter","surgery","private",true,"G",true,true}
    };

    priority_queue<Patient, vector<Patient>, comparePatient> pq;

    int choice;

    do {
        cout << "\n1 Add\n2 Process\n3 Load\n4 Clear File\n5 Exit\n";
        cin >> choice;

        if(choice == 1) {
            Patient p = inputPatient();
            pq.push(p);
            savePatientToFile(p);
        }

        else if(choice == 2) {

            if(pq.empty()) {
                cout << "No patients\n";
                continue;
            }

            Patient p = pq.top();
            pq.pop();

            map<string,int> dist = dijkstra(p.location);

            string amb = selectAmbulance(ambulances, dist);
            cout << "Ambulance: " << amb << endl;

            printPath(amb, p.location);

            string type = getHospitalType(p.condition);
            Hospital h = findNearestHospital(hospitals, type, p.category, p.insured, p.severity, dist);

            if(h.name == "NoHospital") {
                cout << "No suitable hospital found for selected categories/insurance constraints\n";
            } else {
                cout << "Hospital Assigned: " << h.name << " (" << h.category << ")" << endl;
            }

            priority_queue<Patient, vector<Patient>, comparePatient> temp;
            temp.push(p);
            simulateER(temp);
        }

        else if(choice == 3) {
            loadPatientsFromFile(pq);
        }

        else if(choice == 4) {
            clearFile();
            cout << "File cleared\n";
        }

    } while(choice != 5);

    return 0;
}