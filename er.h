#ifndef ER_H
#define ER_H

#include <queue>
#include <iostream>
using namespace std;

void simulateER(priority_queue<Patient, vector<Patient>, comparePatient> pq) {

    cout << "\n--- ER ---\n";

    while(!pq.empty()) {
        Patient p = pq.top();
        pq.pop();

        cout << "Treating " << p.location
             << " severity " << p.severity << endl;
    }
}

#endif