import unittest
from backend.memory.memory_writer import get_memory_store, log_event
from backend.memory.memory_writer import delete_entry

class MemoryStoreTest(unittest.TestCase):
    def setUp(self):
        self.store = get_memory_store()
        self.store.clear()

    def tearDown(self):
        self.store.clear()

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

if __name__ == '__main__':
    unittest.main()
