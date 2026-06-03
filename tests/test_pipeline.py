from pipeline.sessions.session_manager import SessionManager


def test_session_manager_creation():

    manager = SessionManager()

    assert manager is not None


def test_reentry_detection():

    manager = SessionManager()

    visitor_id = "test_visitor"

    manager.mark_exit(
        visitor_id
    )

    assert manager.is_reentry(
        visitor_id
    ) is True


def test_session_creation():

    manager = SessionManager()

    result = manager.update(
        "visitor_1",
        "FOH"
    )

    assert result[
        "event_type"
    ] == "ZONE_ENTER"


def test_zone_history():

    manager = SessionManager()

    manager.update(
        "visitor_2",
        "FOH"
    )

    history = manager.get_zone_history(
        "visitor_2"
    )

    assert len(history) > 0