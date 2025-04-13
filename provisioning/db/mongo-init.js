db = db.getSiblingDB('peerprep-g02');

db.createCollection('usermodels');
// Seed in some admin users for testing
db.usermodels.insertMany([
    // email: email@domain.com, password: adminuser
    {
        username: "adminuser",
        email: "email@domain.com",
        password: "$2b$10$0Pjjg1JWlOUVhX5LKzLEyOEe7oyY8yh4jVyDLn2EPWryMSwOQkegu",
        isAdmin: true,
        createdAt: new Date(),
    },
    // email: admin, password: admin
    {
        username: "admin",
        email: "admin",
        password: "$2b$10$3p5dLNff76R5LzctNTwM8.2qi4mdm0r4kudCSvQ.lEg1YyF6DGiTG",
        isAdmin: true,
        createdAt: new Date(),
    },
    // email: admin1, password: admin
    {
        username: "admin1",
        email: "admin1",
        password: "$2b$10$3p5dLNff76R5LzctNTwM8.2qi4mdm0r4kudCSvQ.lEg1YyF6DGiTG",
        isAdmin: true,
        createdAt: new Date(),
    }
]);

db.usermodels.createIndex({ username: 1 }, { unique: true });

print("Users successfully initialized");

db.createCollection('questionmodels');
const encodedData = [
    {
        title: "UmV2ZXJzZSBhIFN0cmluZw==",
        description: "V3JpdGUgYSBmdW5jdGlvbiB0aGF0IHJldmVyc2VzIGEgc3RyaW5nLiBUaGUgaW5wdXQgc3RyaW5nIGlzIGdpdmVuIGFzIGFuIGFycmF5IG9mIGNoYXJhY3RlcnMgcy4KCllvdSBtdXN0IGRvIHRoaXMgYnkgbW9kaWZ5aW5nIHRoZSBpbnB1dCBhcnJheSBpbi1wbGFjZSB3aXRoIE8oMSkgZXh0cmEgbWVtb3J5LgoKRXhhbXBsZSAxOgoKSW5wdXQ6IHMgPQpbImgiLCJlIiwibCIsImwiLCJvIl0KT3V0cHV0OgpbIm8iLCJsIiwibCIsImUiLCJoIl0KCkV4YW1wbGUgMjoKCklucHV0OiBzID0gClsiSCIsImEiLCJuIiwibiIsImEiLCJoIl0KT3V0cHV0OgpbImgiLCJhIiwibiIsIm4iLCJhIiwiSCJdCgpDb25zdHJhaW50czoKCjEgPD0gcy5sZW5ndGggPD0gMTBeNQpzW2ldIGlzIGEgcHJpbnRhYmxlIGFzY2lpIGNoYXJhY3Rlci4=",
        category: ["strings","algorithms"],
        complexity: "easy",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "TGlua2VkIExpc3QgQ3ljbGUgRGV0ZWN0aW9u",
        description: "SW1wbGVtZW50IGEgZnVuY3Rpb24gdG8gZGV0ZWN0IGlmIGEgbGlua2VkIGxpc3QgY29udGFpbnMgYSBjeWNsZS4=",
        category: ["data structures","algorithms"],
        complexity: "easy",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "Um9tYW4gdG8gSW50ZWdlcg==",
        description: "R2l2ZW4gYSByb21hbiBudW1lcmFsLCBjb252ZXJ0IGl0IHRvIGFuIGludGVnZXIu",
        category: ["algorithms"],
        complexity: "easy",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "QWRkIEJpbmFyeQ==",
        description: "R2l2ZW4gdHdvIGJpbmFyeSBzdHJpbmdzIGEgYW5kIGIsIHJldHVybiB0aGVpciBzdW0gYXMgYSBiaW5hcnkgc3RyaW5nLg==",
        category: ["bit manipulation","algorithms"],
        complexity: "easy",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "Rmlib25hY2NpIE51bWJlcg==",
        description: "VGhlIEZpYm9uYWNjaSBudW1iZXJzLCBjb21tb25seSBkZW5vdGVkIEYobikgZm9ybSBhIHNlcXVlbmNlLCBjYWxsZWQgdGhlIEZpYm9uYWNjaSBzZXF1ZW5jZSwgc3VjaCB0aGF0IGVhY2ggbnVtYmVyIGlzIHRoZSBzdW0gb2YgdGhlIHR3byBwcmVjZWRpbmcgb25lcywgc3RhcnRpbmcgZnJvbSAwIGFuZCAxLiBUaGF0IGlzLAoKRigwKSA9IDAsIEYoMSkgPSAxCkYobikgPSBGKG4gLSAxKSArIEYobiAtMiksIGZvciBuID4gMS4KCkdpdmVuIG4sIGNhbGN1bGF0ZSBGKG4pLg==",
        category: ["recursion","algorithms"],
        complexity: "easy",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "SW1wbGVtZW50IFN0YWNrIHVzaW5nIFF1ZXVlcw==",
        description: "SW1wbGVtZW50IGEgbGFzdC1pbi1maXJzdC1vdXQgKExJRk8pIHN0YWNrIHVzaW5nIG9ubHkgdHdvIHF1ZXVlcy4gVGhlIGltcGxlbWVudGVkIHN0YWNrIHNob3VsZCBzdXBwb3J0IGFsbCB0aGUgZnVuY3Rpb25zIG9mIGEgbm9ybWFsIHN0YWNrIChwdXNoLCB0b3AsIHBvcCwgYW5kIGVtcHR5KS4=",
        category: ["data structures"],
        complexity: "easy",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "Q29tYmluZSBUd28gVGFibGVz",
        description: "R2l2ZW4gdGFibGUgUGVyc29uIHdpdGggdGhlIGZvbGxvd2luZyBjb2x1bW5zOgoxLiBwZXJzb25JZCAoaW50KQoyLiBsYXN0TmFtZSAodmFyY2hhcikKMy4gZmlyc3ROYW1lICh2YXJjaGFyKQpwZXJzb25JZCBpcyB0aGUgcHJpbWFyeSBrZXkuCgpBbmQgdGFibGUgQWRkcmVzcyB3aXRoIHRoZSBmb2xsb3dpbmcgY29sdW1uczoKMS4gYWRkcmVzc0lkIChpbnQpCjIuIHBlcnNvbklkIChpbnQpCjMuIGNpdHkgKHZhcmNoYXIpCjQuIHN0YXRlICh2YXJjaGFyKQphZGRyZXNzSWQgaXMgdGhlIHByaW1hcnkga2V5LgoKV3JpdGUgYSBzb2x1dGlvbiB0byByZXBvcnQgdGhlIGZpcnN0IG5hbWUsIGxhc3QgbmFtZSwgY2l0eSwgYW5kIHN0YXRlIG9mIGVhY2ggcGVyc29uIGluIHRoZSBQZXJzb24gdGFibGUuIElmIHRoZSBhZGRyZXNzIG9mIGEgcGVyc29uSWQgaXMgbm90IHByZXNlbnQgaW4gdGhlIEFkZHJlc3MgdGFibGUsIHJlcG9ydCBudWxsIGluc3RlYWQuClJldHVybiB0aGUgcmVzdWx0IHRhYmxlIGluIGFueSBvcmRlci4=",
        category: ["databases"],
        complexity: "easy",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "UmVwZWF0ZWQgRE5BIFNlcXVlbmNlcw==",
        description: "VGhlIEROQSBzZXF1ZW5jZSBpcyBjb21wb3NlZCBvZiBhIHNlcmllcyBvZiBudWNsZW90aWRlcyBhYmJyZXZpYXRlZCBhcyAnQScsICdDJywgJ0cnLCBhbmQgJ1QnLgoKRm9yIGV4YW1wbGUsICJBQ0dBQVRUQ0NHIiBpcyBhIEROQSBzZXF1ZW5jZS4KV2hlbiBzdHVkeWluZyBETkEsIGl0IGlzIHVzZWZ1bCB0byBpZGVudGlmeSByZXBlYXRlZCBzZXF1ZW5jZXMgd2l0aGluIHRoZSBETkEuCgpHaXZlbiBhIHN0cmluZyBzIHRoYXQgcmVwcmVzZW50cyBhIEROQSBzZXF1ZW5jZSwgcmV0dXJuIGFsbCB0aGUgMTAtbGV0dGVyLWxvbmcgc2VxdWVuY2VzIChzdWJzdHJpbmdzKSB0aGF0IG9jY3VyIG1vcmUgdGhhbiBvbmNlIGluIGEgRE5BIG1vbGVjdWxlLiBZb3UgbWF5IHJldHVybiB0aGUgYW5zd2VyIGluIGFueSBvcmRlci4=",
        category: ["algorithms","bit manipulation"],
        complexity: "medium",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "Q291cnNlIFNjaGVkdWxl",
        description: "VGhlcmUgYXJlIGEgdG90YWwgb2YgbnVtQ291cnNlcyBjb3Vyc2VzIHlvdSBoYXZlIHRvIHRha2UsIGxhYmVsZWQgZnJvbSAwIHRvIG51bUNvdXJzZXMgLSAxLiBZb3UgYXJlIGdpdmVuIGFuIGFycmF5IHByZXJlcXVpc2l0ZXMgd2hlcmUgcHJlcmVxdWlzaXRlc1tpXSA9IFthaSwgYmldIGluZGljYXRlcyB0aGF0IHlvdSBtdXN0IHRha2UgY291cnNlIGJpIGZpcnN0IGlmIHlvdSB3YW50IHRvIHRha2UgY291cnNlIGFpLgoKRm9yIGV4YW1wbGUsIHRoZSBwYWlyIFswLCAxXSwgaW5kaWNhdGVzIHRoYXQgdG8gdGFrZSBjb3Vyc2UgMCB5b3UgaGF2ZSB0byBmaXJzdCB0YWtlIGNvdXJzZSAxLgpSZXR1cm4gdHJ1ZSBpZiB5b3UgY2FuIGZpbmlzaCBhbGwgY291cnNlcy4gT3RoZXJ3aXNlLCByZXR1cm4gZmFsc2Uu",
        category: ["algorithms","data structures"],
        complexity: "medium",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "TFJVIENhY2hlIERlc2lnbg==",
        description: "RGVzaWduIGFuZCBpbXBsZW1lbnQgYW4gTFJVIChMZWFzdCBSZWNlbnRseSBVc2VkKSBjYWNoZS4=",
        category: ["data structures"],
        complexity: "medium",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "TG9uZ2VzdCBDb21tb24gU3Vic2VxdWVuY2U=",
        description: "R2l2ZW4gdHdvIHN0cmluZ3MgdGV4dDEgYW5kIHRleHQyLCByZXR1cm4gdGhlIGxlbmd0aCBvZiB0aGVpciBsb25nZXN0IGNvbW1vbiBzdWJzZXF1ZW5jZS4gSWYgdGhlcmUgaXMgbm8gY29tbW9uIHN1YnNlcXVlbmNlLCByZXR1cm4gMC4KCkEgc3Vic2VxdWVuY2Ugb2YgYSBzdHJpbmcgaXMgYSBuZXcgc3RyaW5nIGdlbmVyYXRlZCBmcm9tIHRoZSBvcmlnaW5hbCBzdHJpbmcgd2l0aCBzb21lIGNoYXJhY3RlcnMgKGNhbiBiZSBub25lKSBkZWxldGVkIHdpdGhvdXQgY2hhbmdpbmcgdGhlIHJlbGF0aXZlIG9yZGVyIG9mIHRoZSByZW1haW5pbmcgY2hhcmFjdGVycy4KCkZvciBleGFtcGxlLCAiYWNlIiBpcyBhIHN1YnNlcXVlbmNlIG9mICJhYmNkZSIuCkEgY29tbW9uIHN1YnNlcXVlbmNlIG9mIHR3byBzdHJpbmdzIGlzIGEgc3Vic2VxdWVuY2UgdGhhdCBpcyBjb21tb24gdG8gYm90aCBzdHJpbmdzLg==",
        category: ["strings","algorithms"],
        complexity: "medium",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "Um90YXRlIEltYWdl",
        description: "WW91IGFyZSBnaXZlbiBhbiBuIHggbiAyRCBtYXRyaXggcmVwcmVzZW50aW5nIGFuIGltYWdlLCByb3RhdGUgdGhlIGltYWdlIGJ5IDkwIGRlZ3JlZXMgKGNsb2Nrd2lzZSku",
        category: ["arrays","algorithms"],
        complexity: "medium",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "QWlycGxhbmUgU2VhdCBBc3NpZ25tZW50IFByb2JhYmlsaXR5",
        description: "biBwYXNzZW5nZXJzIGJvYXJkIGFuIGFpcnBsYW5lIHdpdGggZXhhY3RseSBuIHNlYXRzLiBUaGUgZmlyc3QgcGFzc2VuZ2VyIGhhcyBsb3N0IHRoZSB0aWNrZXQgYW5kIHBpY2tzIGEgc2VhdCByYW5kb21seS4gQnV0IGFmdGVyIHRoYXQsIHRoZSByZXN0IG9mIHRoZSBwYXNzZW5nZXJzIHdpbGw6CgpUYWtlIHRoZWlyIG93biBzZWF0IGlmIGl0IGlzIHN0aWxsIGF2YWlsYWJsZSwgYW5kClBpY2sgb3RoZXIgc2VhdHMgcmFuZG9tbHkgd2hlbiB0aGV5IGZpbmQgdGhlaXIgc2VhdCBvY2N1cGllZC4KClJldHVybiB0aGUgcHJvYmFiaWxpdHkgdGhhdCB0aGUgbnRoIHBlcnNvbiBnZXRzIGhpcyBvd24gc2VhdC4=",
        category: ["brainteaser"],
        complexity: "medium",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "VmFsaWRhdGUgQmluYXJ5IFNlYXJjaCBUcmVl",
        description: "R2l2ZW4gdGhlIHJvb3Qgb2YgYSBiaW5hcnkgdHJlZSwgZGV0ZXJtaW5lIGlmIGl0IGlzIGEgdmFsaWQgYmluYXJ5IHNlYXJjaCB0cmVlIChCU1QpLg==",
        category: ["data structures","algorithms"],
        complexity: "medium",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "U2xpZGluZyBXaW5kb3cgTWF4aW11bQ==",
        description: "WW91IGFyZSBnaXZlbiBhbiBhcnJheSBvZiBpbnRlZ2VycyBudW1zLCB0aGVyZSBpcyBhIHNsaWRpbmcgd2luZG93IG9mIHNpemUgayB3aGljaCBpcyBtb3ZpbmcgZnJvbSB0aGUgdmVyeSBsZWZ0IG9mIHRoZSBhcnJheSB0byB0aGUgdmVyeSByaWdodC4gWW91IGNhbiBvbmx5IHNlZSB0aGUgayBudW1iZXJzIGluIHRoZSB3aW5kb3cuIEVhY2ggdGltZSB0aGUgc2xpZGluZyB3aW5kb3cgbW92ZXMgcmlnaHQgYnkgb25lIHBvc2l0aW9uLgoKUmV0dXJuIHRoZSBtYXggc2xpZGluZyB3aW5kb3cu",
        category: ["arrays","algorithms"],
        complexity: "hard",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "Ti1RdWVlbiBQcm9ibGVt",
        description: "VGhlIG4tcXVlZW5zIHB1enpsZSBpcyB0aGUgcHJvYmxlbSBvZiBwbGFjaW5nIG4gcXVlZW5zIG9uIGFuIG4geCBuIGNoZXNzYm9hcmQgc3VjaCB0aGF0IG5vIHR3byBxdWVlbnMgYXR0YWNrIGVhY2ggb3RoZXIuCgpHaXZlbiBhbiBpbnRlZ2VyIG4sIHJldHVybiBhbGwgZGlzdGluY3Qgc29sdXRpb25zIHRvIHRoZSBuLXF1ZWVucyBwdXp6bGUuIFlvdSBtYXkgcmV0dXJuIHRoZSBhbnN3ZXIgaW4gYW55IG9yZGVyLgoKRWFjaCBzb2x1dGlvbiBjb250YWlucyBhIGRpc3RpbmN0IGJvYXJkIGNvbmZpZ3VyYXRpb24gb2YgdGhlIG4tcXVlZW5zJyBwbGFjZW1lbnQsIHdoZXJlICdRJyBhbmQgJy4nIGJvdGggaW5kaWNhdGUgYSBxdWVlbiBhbmQgYW4gZW1wdHkgc3BhY2UsIHJlc3BlY3RpdmVseS4=",
        category: ["algorithms"],
        complexity: "hard",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "U2VyaWFsaXplIGFuZCBEZXNlcmlhbGl6ZSBhIEJpbmFyeSBUcmVl",
        description: "U2VyaWFsaXphdGlvbiBpcyB0aGUgcHJvY2VzcyBvZiBjb252ZXJ0aW5nIGEgZGF0YSBzdHJ1Y3R1cmUgb3Igb2JqZWN0IGludG8gYSBzZXF1ZW5jZSBvZiBiaXRzIHNvIHRoYXQgaXQgY2FuIGJlIHN0b3JlZCBpbiBhIGZpbGUgb3IgbWVtb3J5IGJ1ZmZlciwgb3IgdHJhbnNtaXR0ZWQgYWNyb3NzIGEgbmV0d29yayBjb25uZWN0aW9uIGxpbmsgdG8gYmUgcmVjb25zdHJ1Y3RlZCBsYXRlciBpbiB0aGUgc2FtZSBvciBhbm90aGVyIGNvbXB1dGVyIGVudmlyb25tZW50LgoKRGVzaWduIGFuIGFsZ29yaXRobSB0byBzZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGEgYmluYXJ5IHRyZWUuIFRoZXJlIGlzIG5vIHJlc3RyaWN0aW9uIG9uIGhvdyB5b3VyIHNlcmlhbGl6YXRpb24vZGVzZXJpYWxpemF0aW9uIGFsZ29yaXRobSBzaG91bGQgd29yay4gWW91IGp1c3QgbmVlZCB0byBlbnN1cmUgdGhhdCBhIGJpbmFyeSB0cmVlIGNhbiBiZSBzZXJpYWxpemVkIHRvIGEgc3RyaW5nIGFuZCB0aGlzIHN0cmluZyBjYW4gYmUgZGVzZXJpYWxpemVkIHRvIHRoZSBvcmlnaW5hbCB0cmVlIHN0cnVjdHVyZS4=",
        category: ["algorithms","data structures"],
        complexity: "hard",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "V2lsZGNhcmQgTWF0Y2hpbmc=",
        description: "R2l2ZW4gYW4gaW5wdXQgc3RyaW5nIChzKSBhbmQgYSBwYXR0ZXJuIChwKSwgaW1wbGVtZW50IHdpbGRjYXJkIHBhdHRlcm4gbWF0Y2hpbmcgd2l0aCBzdXBwb3J0IGZvciAnPycgYW5kICcqJyB3aGVyZToKCic/JyBNYXRjaGVzIGFueSBzaW5nbGUgY2hhcmFjdGVyLgonKicgTWF0Y2hlcyBhbnkgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyAoaW5jbHVkaW5nIHRoZSBlbXB0eSBzZXF1ZW5jZSkuCgpUaGUgbWF0Y2hpbmcgc2hvdWxkIGNvdmVyIHRoZSBlbnRpcmUgaW5wdXQgc3RyaW5nIChub3QgcGFydGlhbCku",
        category: ["algorithms","strings"],
        complexity: "hard",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "Q2hhbGtib2FyZCBYT1IgR2FtZQ==",
        description: "WW91IGFyZSBnaXZlbiBhbiBhcnJheSBvZiBpbnRlZ2VycyBudW1zIHJlcHJlc2VudHMgdGhlIG51bWJlcnMgd3JpdHRlbiBvbiBhIGNoYWxrYm9hcmQuCgpBbGljZSBhbmQgQm9iIHRha2UgdHVybnMgZXJhc2luZyBleGFjdGx5IG9uZSBudW1iZXIgZnJvbSB0aGUgY2hhbGtib2FyZCwgd2l0aCBBbGljZSBzdGFydGluZyBmaXJzdC4gSWYgZXJhc2luZyBhIG51bWJlciBjYXVzZXMgdGhlIGJpdHdpc2UgWE9SIG9mIGFsbCB0aGUgZWxlbWVudHMgb2YgdGhlIGNoYWxrYm9hcmQgdG8gYmVjb21lIDAsIHRoZW4gdGhhdCBwbGF5ZXIgbG9zZXMuIFRoZSBiaXR3aXNlIFhPUiBvZiBvbmUgZWxlbWVudCBpcyB0aGF0IGVsZW1lbnQgaXRzZWxmLCBhbmQgdGhlIGJpdHdpc2UgWE9SIG9mIG5vIGVsZW1lbnRzIGlzIDAuCgpBbHNvLCBpZiBhbnkgcGxheWVyIHN0YXJ0cyB0aGVpciB0dXJuIHdpdGggdGhlIGJpdHdpc2UgWE9SIG9mIGFsbCB0aGUgZWxlbWVudHMgb2YgdGhlIGNoYWxrYm9hcmQgZXF1YWwgdG8gMCwgdGhlbiB0aGF0IHBsYXllciB3aW5zLgoKUmV0dXJuIHRydWUgaWYgYW5kIG9ubHkgaWYgQWxpY2Ugd2lucyB0aGUgZ2FtZSwgYXNzdW1pbmcgYm90aCBwbGF5ZXJzIHBsYXkgb3B0aW1hbGx5Lg==",
        category: ["brainteaser"],
        complexity: "hard",
        createdAt: new Date(),
        modifiedAt: new Date(),
    },
    {
        title: "VHJpcHMgYW5kIFVzZXJz",
        description: "R2l2ZW4gdGFibGUgVHJpcHM6CjEuIGlkIChpbnQpCjIuIGNsaWVudF9pZCAoaW50KQozLiBkcml2ZXJfaWQgKGludCkKNC4gY2l0eV9pZCAoaW50KQo1LiBzdGF0dXMgKGVudW0pCjYuIHJlcXVlc3RfYXQoZGF0ZSkKaWQgaXMgdGhlIHByaW1hcnkga2V5LgoKVGhlIHRhYmxlIGhvbGRzIGFsbCB0YXhpIHRyaXBzLiBFYWNoIHRyaXAgaGFzIGEgdW5pcXVlIGlkLCB3aGlsZSBjbGllbnRfaWQgYW5kIGRyaXZlcl9pZCBhcmUgZm9yZWlnbiBrZXlzIHRvIHRoZSB1c2Vyc19pZCBhdCB0aGUgVXNlcnMgdGFibGUuIFN0YXR1cyBpcyBhbiBFTlVNIChjYXRlZ29yeSkgdHlwZSBvZiAoJ2NvbXBsZXRlZCcsICdjYW5jZWxsZWRfYnlfZHJpdmVyJywgJ2NhbmNlbGxlZF9ieV9jbGllbnQnKS4KCkFuZCB0YWJsZSBVc2VyczoKMS4gdXNlcnNfaWQgKGludCkKMi4gYmFubmVkIChlbnVtKQozLiByb2xlIChlbnVtKQp1c2Vyc19pZCBpcyB0aGUgcHJpbWFyeSBrZXkgKGNvbHVtbiB3aXRoIHVuaXF1ZSB2YWx1ZXMpIGZvciB0aGlzIHRhYmxlLgpUaGUgdGFibGUgaG9sZHMgYWxsIHVzZXJzLiBFYWNoIHVzZXIgaGFzIGEgdW5pcXVlIHVzZXJzX2lkLCBhbmQgcm9sZSBpcyBhbiBFTlVNIHR5cGUgb2YgKCdjbGllbnQnLCAnZHJpdmVyJywgJ3BhcnRuZXInKS4KYmFubmVkIGlzIGFuIEVOVU0gKGNhdGVnb3J5KSB0eXBlIG9mICgnWWVzJywgJ05vJykuClRoZSBjYW5jZWxsYXRpb24gcmF0ZSBpcyBjb21wdXRlZCBieSBkaXZpZGluZyB0aGUgbnVtYmVyIG9mIGNhbmNlbGVkIChieSBjbGllbnQgb3IgZHJpdmVyKSByZXF1ZXN0cyB3aXRoIHVuYmFubmVkIHVzZXJzIGJ5IHRoZSB0b3RhbCBudW1iZXIgb2YgcmVxdWVzdHMgd2l0aCB1bmJhbm5lZCB1c2VycyBvbiB0aGF0IGRheS4KCldyaXRlIGEgc29sdXRpb24gdG8gZmluZCB0aGUgY2FuY2VsbGF0aW9uIHJhdGUgb2YgcmVxdWVzdHMgd2l0aCB1bmJhbm5lZCB1c2VycyAoYm90aCBjbGllbnQgYW5kIGRyaXZlciBtdXN0IG5vdCBiZSBiYW5uZWQpIGVhY2ggZGF5IGJldHdlZW4gIjIwMTMtMTAtMDEiIGFuZCAiMjAxMy0xMC0wMyIuIFJvdW5kIENhbmNlbGxhdGlvbiBSYXRlIHRvIHR3byBkZWNpbWFsIHBvaW50cy4KClJldHVybiB0aGUgcmVzdWx0IHRhYmxlIGluIGFueSBvcmRlcg==",
        category: ["databases"],
        complexity: "hard",
        createdAt: new Date(),
        modifiedAt: new Date(),
    }
];

const decodedData = encodedData.map(q => ({
    title: atob(q.title),
    description: atob(q.description),
    category: q.category,
    complexity: q.complexity,
    createdAt: q.createdAt,
    modifiedAt: q.modifiedAt
}));

db.questionmodels.insertMany(decodedData);

print(`${decodedData.length} questions successfully initialized`);
