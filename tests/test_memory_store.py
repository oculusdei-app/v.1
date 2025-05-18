import unittest
from backend.memory.memory_writer import get_memory_store, log_event
from backend.memory.memory_writer import delete_entry
from backend.memory.memory_store import MemoryEntry
from backend.memory.memory_store import MemoryStore


class MemoryStoreTest(unittest.TestCase):
    def setUp(self):
        self.store = get_memory_store()
        self.store.clear()

    def tearDown(self):
        self.store.clear()

    def test_smoke_test(self):
        """Simple smoke test to verify basic memory store functionality"""
        # Create a memory entry
        entry_id = log_event("Smoke test entry")
        self.assertIsNotNone(entry_id)
        
        # Retrieve it
        entry = self.store.get_by_id(entry_id)
        self.assertIsNotNone(entry)
        self.assertEqual(entry.content, "Smoke test entry")
        
        # Check it appears in the list
        all_entries = self.store.get_all()
        self.assertGreaterEqual(len(all_entries), 1)

    def test_store_and_get_by_id(self):
        entry_id = log_event("test event", {})
        entry = self.store.get_by_id(entry_id)
        self.assertIsNotNone(entry)
        self.assertEqual(entry.content, "test event")

    def test_get_last(self):
        log_event("first")
        log_event("second")
        entries = self.store.get_last(1)
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0].content, "second")

    def test_delete_entry(self):
        entry_id = log_event("to delete")
        deleted = delete_entry(entry_id)
        self.assertTrue(deleted)
        self.assertIsNone(self.store.get_by_id(entry_id))

    def test_semantic_search(self):
        self.store.clear()
        id_ml = log_event("Started machine learning project")
        log_event("Went grocery shopping")

        results = self.store.search_by_similarity("ML project", top_n=1)
        self.assertEqual(results[0].id, id_ml)

    def test_update_and_regex_search(self):
        entry_id = log_event("initial content")
        updated = self.store.update_entry(entry_id, content="new content about health")
        self.assertTrue(updated)
        results = self.store.search_by_regex("health")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].id, entry_id)

    def test_metadata_substring_search(self):
        log_event("gym session", {"category": "health-gym"})
        log_event("team meeting", {"category": "work"})
        results = self.store.search_by_metadata_value("category", "health")
        self.assertEqual(len(results), 1)

    def test_store_rejects_empty_content(self):
        entry = MemoryEntry(type="event", content="", metadata={})
        with self.assertRaises(ValueError):
            self.store.store(entry)

if __name__ == '__main__':
    unittest.main()
