package com.nut.health;
import java.util.UUID;
public class TimelineNotFoundException extends RuntimeException { public TimelineNotFoundException(UUID id){super("Timeline entry not found: "+id);} }
