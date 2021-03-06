package com.castorls.escapegame.textcode;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Config {

  public enum Type {
    MOT, LETTRE, CHIFFRE;
  }

  @JsonProperty
  public String key;

  @JsonProperty
  public Type type;

  public String getKey() {
    return key;
  }

  public void setKey(String key) {
    this.key = key;
  }

  public Type getType() {
    return type;
  }

  public void setType(Type type) {
    this.type = type;
  }

}
