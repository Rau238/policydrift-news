import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { getCalendarEvents } from '../services/calendar.service.js';
import * as calendarModel from '../models/calendar.model.js';
import { pool } from '../db/pool.js';

describe('Calendar Service & Model Test Suite', () => {
  const refDate = new Date('2026-09-09T00:00:00Z');

  after(async () => {
    try {
      await pool.end();
    } catch {
      // ignore
    }
  });

  it('1. Returns all unified calendar events with valid schema', async () => {
    const res = await getCalendarEvents({}, refDate);
    assert.ok(res.events.length > 0, 'Should have events');
    assert.strictEqual(res.total, res.events.length);
    assert.ok(res.summary, 'Should include summary');
    assert.ok(res.summary.counts.total > 0);

    const first = res.events[0];
    assert.ok(first.id);
    assert.ok(first.type);
    assert.ok(first.title);
    assert.ok(first.date);
    assert.ok(first.countdown);
  });

  it('2. Filters by type accurately (economy)', async () => {
    const res = await getCalendarEvents({ type: 'economy' }, refDate);
    assert.ok(res.events.length > 0);
    assert.ok(res.events.every((e) => e.type === 'economy'));
  });

  it('3. Filters by type accurately (holidays)', async () => {
    const res = await getCalendarEvents({ type: 'holidays' }, refDate);
    assert.ok(res.events.length > 0);
    assert.ok(res.events.every((e) => e.type === 'holiday'));
  });

  it('4. Filters by country (IN)', async () => {
    const res = await getCalendarEvents({ country: 'IN' }, refDate);
    assert.ok(res.events.length > 0);
    assert.ok(res.events.every((e) => e.country === 'IN' || e.country === 'GLOBAL'));
  });

  it('5. Filters by impact (high)', async () => {
    const res = await getCalendarEvents({ impact: 'high' }, refDate);
    assert.ok(res.events.length > 0);
    assert.ok(res.events.every((e) => e.impact === 'high'));
  });

  it('6. Filters by search query', async () => {
    const res = await getCalendarEvents({ search: 'CPI' }, refDate);
    assert.ok(res.events.length > 0);
    assert.ok(res.events.some((e) => e.title.includes('CPI')));
  });

  it('7. Summary highlights upcoming economic event and holiday countdowns', async () => {
    const res = await getCalendarEvents({}, refDate);
    assert.ok(res.summary.nextEconomicEvent, 'Should identify next economic event');
    assert.ok(res.summary.nextMarketHoliday, 'Should identify next market holiday');
    assert.ok(res.summary.nextEconomicEvent.daysDiff >= 0, 'Next event should be today or in future');
  });

  it('8. Filters by type accurately (commodities)', async () => {
    const res = await getCalendarEvents({ type: 'commodities' }, refDate);
    assert.ok(res.events.length > 0);
    assert.ok(res.events.every((e) => e.type === 'commodity'));
  });

  it('9. CRUD operations via Calendar Model (Create, Read, Update, Toggle, Delete)', async () => {
    const testId = `test-unit-${Date.now()}`;
    const created = await calendarModel.createCalendarEvent({
      id: testId,
      type: 'economy',
      title: 'Unit Test Monetary Announcement',
      date: '2026-10-15',
      time: '14:00 GMT',
      country: 'IN',
      impact: 'high',
      forecast: '5.50%',
      previous: '5.25%',
      authority: 'Reserve Bank of India',
    });

    assert.ok(created, 'Event should be created');
    assert.strictEqual(created.id, testId);
    assert.strictEqual(created.title, 'Unit Test Monetary Announcement');

    // Read
    const fetched = await calendarModel.getCalendarEventById(testId);
    assert.ok(fetched);
    assert.strictEqual(fetched.id, testId);

    // Update
    const updated = await calendarModel.updateCalendarEvent(testId, {
      title: 'Updated Unit Test Announcement',
      actual: '5.40%',
    });
    assert.strictEqual(updated.title, 'Updated Unit Test Announcement');
    assert.strictEqual(updated.actual, '5.40%');

    // Toggle
    const toggled = await calendarModel.toggleCalendarEventActive(testId);
    assert.strictEqual(toggled.isActive, false, 'Should be toggled to false');

    // Delete
    const deleted = await calendarModel.deleteCalendarEvent(testId);
    assert.ok(deleted, 'Should be deleted');

    const verifyDeleted = await calendarModel.getCalendarEventById(testId);
    assert.strictEqual(verifyDeleted, null, 'Event should no longer exist');
  });
});
