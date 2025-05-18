import unittest
from backend.memory.memory_writer import get_memory_store, log_error
from backend.memory.reflector import MemoryReflector


class MemoryReflectorTest(unittest.TestCase):
    def setUp(self):
        self.store = get_memory_store()
        self.store.clear()

    def tearDown(self):
        self.store.clear()

    def test_reflect_on_recent_errors(self):
        log_error("minor", "warning")
        log_error("major issue", "critical")
        log_error("other", "error")

        reflector = MemoryReflector()
        reflection = reflector._reflect_on_recent_errors()
        self.assertIsNotNone(reflection)
        self.assertIn("error events", reflection)


if __name__ == '__main__':
    unittest.main()
